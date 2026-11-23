// POST /api/agents/sales/run — Trigger sales sequence generation for a prospect.
// Body: { prospect_id: string }
// Auth: admin Supabase session (server/adminAuth.js)
// Runtime: Node.js (needs Claude SDK)

import { checkAuth } from '../../../adminAuth.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runSalesAgent } from '../../sales/runner.js';

const CORS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function setCors(res: VercelResponse): void {
  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
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

    if (!body.prospect_id || typeof body.prospect_id !== 'string') {
      return res.status(400).json({
        error: { code: 'INVALID_REQUEST', message: 'Required: { prospect_id: string }' },
        timestamp: new Date().toISOString(),
      });
    }

    const result = await runSalesAgent({
      trigger: 'api',
      prospect_id: body.prospect_id,
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      error: { code: 'AGENT_ERROR', message: (err as Error).message },
      timestamp: new Date().toISOString(),
    });
  }
}
