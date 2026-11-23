// GET /api/agents/marketing/og-image?draftId=<uuid>
// Returns a PNG branded image rendered from the draft's image_html via Puppeteer.
// Dimensions: 1080×1080 (1:1 square) for all channels (linkedin, facebook, instagram).
// Auth: admin Supabase session (server/adminAuth.js)

export const config = { maxDuration: 60 };

import { checkAuth } from '../../../server/adminAuth.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { renderHtmlToPng } from '../../../server/marketing/puppeteer-renderer.js';

/* ── Helpers ────────────────────────────────────────────────── */

function sb() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/* ── Handler ───────────────────────────────────────────────── */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!(await checkAuth(req))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const draftId = typeof req.query.draftId === 'string' ? req.query.draftId : undefined;

  if (!draftId) {
    return res.status(400).json({ error: 'Missing draftId query param' });
  }

  // Fetch draft from Supabase
  const { data: draft, error } = await sb()
    .from('agent_drafts')
    .select('content, channel')
    .eq('id', draftId)
    .single();

  if (error || !draft) {
    return res.status(404).json({ error: 'Draft not found' });
  }

  const channel = (draft.channel as string) || undefined;
  const content = draft.content as Record<string, unknown>;
  const imageHtml = content?.image_html as string | undefined;

  if (!imageHtml || imageHtml.length === 0) {
    return res.status(422).json({ error: 'Draft has no image_html content' });
  }

  try {
    const pngBuffer = await renderHtmlToPng(imageHtml, channel);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store, must-revalidate');
    return res.status(200).send(pngBuffer);
  } catch (renderErr) {
    return res
      .status(500)
      .json({ error: 'Puppeteer render failed', detail: (renderErr as Error).message });
  }
}
