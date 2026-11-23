// POST /api/agents/sales/prospects-import — Import prospects from CSV or seed data.
// Body: raw CSV text (Content-Type: text/csv or application/json with { csv: "..." })
//       or { seed: true } to import Tunisian seed data
// Auth: admin Supabase session (server/adminAuth.js)

import { checkAuth } from '../../../adminAuth.js';
import { importProspectsFromCsv } from '../../sales/csv-import.js';
import { TUNISIAN_PROSPECTS_SEED_CSV } from '../../../data/tunisian-prospects-seed.js';

import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    let csvText: string;

    const contentType = req.headers['content-type'] ?? '';
    if (contentType.includes('text/csv') || contentType.includes('text/plain')) {
      csvText = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    } else {
      // Expect JSON { csv: "..." } or { seed: true }
      const body = req.body ?? {};

      // Seed data import
      if (body.seed === true) {
        const result = await importProspectsFromCsv(TUNISIAN_PROSPECTS_SEED_CSV);
        return res.status(200).json(result);
      }

      if (!body.csv || typeof body.csv !== 'string') {
        return res.status(400).json({
          error: {
            code: 'INVALID_REQUEST',
            message:
              'Required: { csv: "header\\nrow1\\n..." } or { seed: true } or send text/csv body',
          },
          timestamp: new Date().toISOString(),
        });
      }
      csvText = body.csv;
    }

    const result = await importProspectsFromCsv(csvText);

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      error: { code: 'IMPORT_ERROR', message: (err as Error).message },
      timestamp: new Date().toISOString(),
    });
  }
}
