// POST /api/agents/sales/discover — Queue a prospect discovery job.
// Body: { segment: string, city?: string, count?: number }
// Returns immediately with { job_id, status: 'queued' } (HTTP 202)
// Auth: admin Supabase session (server/adminAuth.js)

import { checkAuth } from '../../../adminAuth.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const FALLBACK_SEGMENTS = ['insurance', 'garage', 'dealer', 'fleet'];

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

    // Fetch valid segments from DB, fallback to hardcoded
    let validSegments = FALLBACK_SEGMENTS;
    const { data: segRows } = await supabase
      .from('agent_discovery_segments')
      .select('slug')
      .eq('enabled', true);
    if (segRows && segRows.length > 0) {
      validSegments = segRows.map((r: any) => r.slug);
    }

    if (!body.segment || !validSegments.includes(body.segment)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: `Required: { segment: "${validSegments.join('" | "')}" }. Optional: city (string), count (1-20).`,
        },
        timestamp: new Date().toISOString(),
      });
    }

    const count = body.count ? Math.min(Math.max(1, Number(body.count)), 20) : 10;

    const { data: job, error } = await supabase
      .from('agent_jobs')
      .insert({
        job_type: 'discover',
        input: {
          segment: body.segment,
          city: body.city || null,
          count,
          trigger: 'api',
        },
      })
      .select('id, status, created_at')
      .single();

    if (error) throw new Error(error.message);

    return res.status(202).json({
      job_id: job.id,
      job_type: 'discover',
      status: 'queued',
      created_at: job.created_at,
      message: `Découverte ${body.segment} mise en file d'attente (${count} prospects max).`,
    });
  } catch (err) {
    return res.status(500).json({
      error: { code: 'QUEUE_ERROR', message: (err as Error).message },
      timestamp: new Date().toISOString(),
    });
  }
}
