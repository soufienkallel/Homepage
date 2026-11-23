// POST /api/agents/sales/enrich — Queue prospect enrichment job(s).
// Body: { prospect_id: string } or { segment?: string, batch_size?: number }
// Returns immediately with { job_id, status: 'queued' } (HTTP 202)
// Auth: admin Supabase session (server/adminAuth.js)

import { checkAuth } from '../../../adminAuth.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' },
      timestamp: new Date().toISOString(),
    });
  }
  if (!(await checkAuth(req))) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Admin session required' },
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const body = req.body ?? {};
    const supabase = getSupabase();

    // Single prospect enrichment → queue one job
    if (body.prospect_id && typeof body.prospect_id === 'string') {
      // Guard: reject if there's already a queued or running enrich job for this prospect
      const { data: existing } = await supabase
        .from('agent_jobs')
        .select('id, status')
        .eq('job_type', 'enrich')
        .in('status', ['queued', 'running'])
        .eq('input->>prospect_id', body.prospect_id)
        .limit(1);

      if (existing && existing.length > 0) {
        return res.status(409).json({
          error: {
            code: 'DUPLICATE_JOB',
            message: 'Un enrichissement est déjà en cours pour ce prospect.',
          },
          existing_job_id: existing[0].id,
          existing_status: existing[0].status,
          timestamp: new Date().toISOString(),
        });
      }

      const { data: job, error } = await supabase
        .from('agent_jobs')
        .insert({
          job_type: 'enrich',
          input: { prospect_id: body.prospect_id, trigger: 'api' },
        })
        .select('id, status, created_at')
        .single();

      if (error) throw new Error(error.message);

      return res.status(202).json({
        job_id: job.id,
        job_type: 'enrich',
        status: 'queued',
        created_at: job.created_at,
        message: "Enrichissement mis en file d'attente.",
      });
    }

    // Batch enrichment → queue one batch job
    const batch_size = body.batch_size ? Math.min(Number(body.batch_size), 10) : 5;
    const { data: job, error } = await supabase
      .from('agent_jobs')
      .insert({
        job_type: 'enrich_batch',
        input: {
          segment: body.segment || null,
          batch_size,
          trigger: 'api',
        },
      })
      .select('id, status, created_at')
      .single();

    if (error) throw new Error(error.message);

    return res.status(202).json({
      job_id: job.id,
      job_type: 'enrich_batch',
      status: 'queued',
      created_at: job.created_at,
      message: `Enrichissement par lot (${batch_size}) mis en file d'attente.`,
    });
  } catch (err) {
    return res.status(500).json({
      error: { code: 'QUEUE_ERROR', message: (err as Error).message },
      timestamp: new Date().toISOString(),
    });
  }
}
