// GET /api/agents/sales/jobs — List recent jobs or get a specific job status.
// Query params: ?id=uuid (single job) or ?status=queued|running|completed|failed&limit=20
// Auth: admin Supabase session (server/adminAuth.js)

export const config = { runtime: 'edge' };

import { checkAuth } from '../../../server/adminAuth.js';
import { createClient } from '@supabase/supabase-js';

const CORS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function sb() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (request.method !== 'GET' && request.method !== 'DELETE') {
    return new Response(
      JSON.stringify({
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET or DELETE' },
        timestamp: new Date().toISOString(),
      }),
      { status: 405, headers: CORS }
    );
  }
  if (!(await checkAuth(request))) {
    return new Response(
      JSON.stringify({
        error: { code: 'UNAUTHORIZED', message: 'Admin session required' },
        timestamp: new Date().toISOString(),
      }),
      { status: 401, headers: CORS }
    );
  }

  try {
    const url = new URL(request.url);

    // DELETE /api/agents/sales/jobs?id=uuid — Cancel a stuck job (mark as failed)
    if (request.method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) {
        return new Response(
          JSON.stringify({
            error: { code: 'BAD_REQUEST', message: 'id query param required' },
            timestamp: new Date().toISOString(),
          }),
          { status: 400, headers: CORS }
        );
      }
      const supabase = sb();
      const { data: job, error: fetchErr } = await supabase
        .from('agent_jobs')
        .select('id, status')
        .eq('id', id)
        .single();
      if (fetchErr || !job) {
        return new Response(
          JSON.stringify({
            error: { code: 'NOT_FOUND', message: `Job ${id} introuvable.` },
            timestamp: new Date().toISOString(),
          }),
          { status: 404, headers: CORS }
        );
      }
      if (job.status === 'completed' || job.status === 'failed') {
        return new Response(
          JSON.stringify({
            error: { code: 'ALREADY_TERMINAL', message: `Job already ${job.status}.` },
            timestamp: new Date().toISOString(),
          }),
          { status: 409, headers: CORS }
        );
      }
      const { error: updateErr } = await supabase
        .from('agent_jobs')
        .update({
          status: 'failed',
          error: 'Cancelled by admin',
          completed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (updateErr) throw new Error(updateErr.message);
      return new Response(JSON.stringify({ cancelled: true, job_id: id }), {
        status: 200,
        headers: CORS,
      });
    }

    const id = url.searchParams.get('id');
    const status = url.searchParams.get('status');
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 20), 100);

    const supabase = sb();

    // Single job by ID
    if (id) {
      const { data: job, error } = await supabase
        .from('agent_jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !job) {
        return new Response(
          JSON.stringify({
            error: { code: 'NOT_FOUND', message: `Job ${id} introuvable.` },
            timestamp: new Date().toISOString(),
          }),
          { status: 404, headers: CORS }
        );
      }

      return new Response(JSON.stringify({ job }), { status: 200, headers: CORS });
    }

    // List jobs
    let query = supabase
      .from('agent_jobs')
      .select('id, job_type, status, input, error, attempts, created_at, started_at, completed_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status && ['queued', 'running', 'completed', 'failed'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: jobs, error } = await query;
    if (error) throw new Error(error.message);

    // Summary counts
    const { data: allJobs } = await supabase.from('agent_jobs').select('status');
    const counts = { queued: 0, running: 0, completed: 0, failed: 0 };
    (allJobs ?? []).forEach((j: { status: string }) => {
      if (j.status in counts) counts[j.status as keyof typeof counts]++;
    });

    return new Response(JSON.stringify({ jobs: jobs ?? [], counts }), {
      status: 200,
      headers: CORS,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: { code: 'QUERY_ERROR', message: (err as Error).message },
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: CORS }
    );
  }
}
