// POST /api/agents/marketing/run — Trigger one marketing-agent run.
// Returns created drafts count and cost.
// Auth: admin Supabase session (server/adminAuth.js) or Vercel Cron (CRON_SECRET)
// Runtime: Node.js (bundled via esbuild into _run-bundle.js)

import { checkAuth } from '../../../adminAuth.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runMarketingAgent } from '../../marketing/runner.js';

const CORS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
  // Accept GET (Vercel Cron) and POST (manual/API)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET or POST' },
      timestamp: new Date().toISOString(),
    });
  }
  if (!(await checkAuth(req, { allowCron: true }))) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Admin session required' },
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const isCron = req.method === 'GET';
    const body = isCron ? {} : (req.body ?? {});

    // Validate draftCount: must be a positive integer, capped at 20
    const VALID_CHANNELS = [
      'linkedin',
      'facebook',
      'instagram',
      'email',
      'linkedin_dm',
      'whatsapp',
    ];
    const VALID_LANGUAGES = ['fr', 'ar', 'en'];
    const VALID_SEGMENTS = ['insurance', 'garage', 'dealer', 'fleet', 'b2c', 'all'];
    const VALID_OBJECTIVES = ['awareness', 'lead_gen', 'conversion', 'engagement', 'recruitment'];

    let draftCount: number | undefined;
    if (typeof body.draftCount === 'number') {
      draftCount = Math.max(1, Math.min(20, Math.floor(body.draftCount)));
    }

    const channels = Array.isArray(body.channels)
      ? body.channels.filter((c: string) => VALID_CHANNELS.includes(c))
      : undefined;

    const languages = Array.isArray(body.languages)
      ? body.languages.filter((l: string) => VALID_LANGUAGES.includes(l))
      : undefined;

    const segment =
      typeof body.segment === 'string' && VALID_SEGMENTS.includes(body.segment)
        ? body.segment
        : undefined;

    const objective =
      typeof body.objective === 'string' && VALID_OBJECTIVES.includes(body.objective)
        ? body.objective
        : undefined;

    const pillars = Array.isArray(body.pillars)
      ? body.pillars.filter((p: unknown) => typeof p === 'string')
      : undefined;

    const result = await runMarketingAgent({
      trigger: isCron ? 'cron' : 'api',
      draftCount,
      channels: channels?.length ? channels : undefined,
      languages: languages?.length ? languages : undefined,
      segment,
      objective,
      pillars: pillars?.length ? pillars : undefined,
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      error: { code: 'AGENT_ERROR', message: (err as Error).message },
      timestamp: new Date().toISOString(),
    });
  }
}
