// POST /api/agents/sales/worker — Process queued agent_jobs (discover, enrich, enrich_batch).
// Picks up to N queued jobs and processes them sequentially.
// Designed to be called by Vercel Cron or manually.
// Auth: admin Supabase session (server/adminAuth.js) or Vercel Cron (CRON_SECRET)
// Runtime: Node.js (needs Claude SDK + web_search server tool)

import { checkAuth } from '../../../adminAuth.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { discoverProspects } from '../../sales/discovery.js';
import { enrichProspect, enrichProspectsBatch } from '../../sales/enrichment.js';
import { createClient } from '@supabase/supabase-js';

const CORS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function setCors(res: VercelResponse): void {
  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
}

function getSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

interface JobResult {
  job_id: string;
  job_type: string;
  status: 'completed' | 'failed';
  duration_ms: number;
  output?: unknown;
  error?: string;
}

type SalesSegment = 'insurance' | 'fleet' | 'garage' | 'dealer' | 'b2c';
type AgentTrigger = 'manual' | 'api' | 'cron';

function toSalesSegment(value: unknown): SalesSegment {
  if (value === 'insurance') return 'insurance';
  if (value === 'fleet') return 'fleet';
  if (value === 'garage') return 'garage';
  if (value === 'dealer') return 'dealer';
  if (value === 'b2c') return 'b2c';
  throw new Error(`Invalid segment: ${String(value)}`);
}

function toAgentTrigger(value: unknown): AgentTrigger {
  if (value === 'manual') return 'manual';
  if (value === 'api') return 'api';
  if (value === 'cron') return 'cron';
  return 'cron';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' },
      timestamp: new Date().toISOString(),
    });
  }
  if (!(await checkAuth(req, { allowCron: true }))) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or missing token' },
      timestamp: new Date().toISOString(),
    });
  }

  const supabase = getSupabase();
  const maxJobs = Math.min(Number(req.body?.max_jobs) || 1, 3);
  const results: JobResult[] = [];

  try {
    // Recover stuck jobs (running for more than 10 minutes → back to queued)
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    await supabase
      .from('agent_jobs')
      .update({ status: 'queued', error: 'Recovered: worker timeout' })
      .eq('status', 'running')
      .lt('started_at', tenMinAgo);

    // Pick up queued jobs (oldest first), limited to maxJobs
    const { data: jobs, error: fetchErr } = await supabase
      .from('agent_jobs')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(maxJobs);

    if (fetchErr) throw new Error(fetchErr.message);
    if (!jobs || jobs.length === 0) {
      return res.status(200).json({
        processed: 0,
        message: 'Aucun job en attente.',
        results: [],
      });
    }

    for (const job of jobs) {
      const startTime = Date.now();

      // Mark as running
      await supabase
        .from('agent_jobs')
        .update({
          status: 'running',
          started_at: new Date().toISOString(),
          attempts: job.attempts + 1,
        })
        .eq('id', job.id);

      try {
        let output: unknown;

        switch (job.job_type) {
          case 'discover': {
            const input = job.input as {
              segment: string;
              city?: string;
              count?: number;
              trigger?: string;
            };
            output = await discoverProspects({
              segment: toSalesSegment(input.segment),
              city: input.city || undefined,
              count: input.count || 10,
              trigger: toAgentTrigger(input.trigger),
            });
            break;
          }
          case 'enrich': {
            const input = job.input as { prospect_id: string; trigger?: string };
            output = await enrichProspect({
              prospect_id: input.prospect_id,
              trigger: toAgentTrigger(input.trigger),
            });
            break;
          }
          case 'enrich_batch': {
            const input = job.input as { segment?: string; batch_size?: number; trigger?: string };
            const batchResults = await enrichProspectsBatch({
              segment: input.segment || undefined,
              batch_size: input.batch_size || 5,
              trigger: toAgentTrigger(input.trigger),
            });
            output = { enriched: batchResults.length, results: batchResults };
            break;
          }
          default:
            throw new Error(`Unknown job_type: ${job.job_type}`);
        }

        const durationMs = Date.now() - startTime;

        // Mark completed
        await supabase
          .from('agent_jobs')
          .update({
            status: 'completed',
            output,
            completed_at: new Date().toISOString(),
          })
          .eq('id', job.id);

        results.push({
          job_id: job.id,
          job_type: job.job_type,
          status: 'completed',
          duration_ms: durationMs,
          output,
        });
      } catch (jobErr) {
        const durationMs = Date.now() - startTime;
        const errorMsg = (jobErr as Error).message;

        // Mark failed (or back to queued if retries remain)
        const newStatus = job.attempts + 1 < job.max_attempts ? 'queued' : 'failed';
        await supabase
          .from('agent_jobs')
          .update({
            status: newStatus,
            error: errorMsg,
            completed_at: newStatus === 'failed' ? new Date().toISOString() : null,
          })
          .eq('id', job.id);

        results.push({
          job_id: job.id,
          job_type: job.job_type,
          status: 'failed',
          duration_ms: durationMs,
          error: errorMsg,
        });
      }
    }

    return res.status(200).json({
      processed: results.length,
      completed: results.filter((r) => r.status === 'completed').length,
      failed: results.filter((r) => r.status === 'failed').length,
      results,
    });
  } catch (err) {
    return res.status(500).json({
      error: { code: 'WORKER_ERROR', message: (err as Error).message },
      timestamp: new Date().toISOString(),
    });
  }
}
