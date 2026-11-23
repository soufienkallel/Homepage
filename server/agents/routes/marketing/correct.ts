// POST /api/agents/marketing/correct — Human-initiated correction of a draft.
// Body: { id: string, instructions: string }
// The admin provides correction instructions (e.g., "Le texte est trop long",
// "L'image déborde", "Remplacer le mot X par Y"), and Claude fixes the draft.
// Auth: admin Supabase session (server/adminAuth.js)
// Runtime: Node.js (bundled via esbuild into _correct-bundle.js)

import { checkAuth } from '../../../adminAuth.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { retryBlockedDraft } from '../../marketing/retry.js';
import { runGuardrails } from '../../shared/guardrails.js';
import type { AgentChannel, AgentLanguage } from '../../shared/types.js';
import type { ClaudeImageInput } from '../../shared/claude-client.js';

const CORS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function setCors(res: VercelResponse): void {
  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
}

function sb() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
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

  const body = req.body ?? {};
  const { id, instructions, images } = body as {
    id?: string;
    instructions?: string;
    /** Optional reference images (base64-encoded) for Claude vision. */
    images?: Array<{ base64: string; media_type: string }>;
  };

  if (!id || !instructions || instructions.trim().length === 0) {
    return res.status(400).json({
      error: { code: 'INVALID_REQUEST', message: 'Required: { id: string, instructions: string }' },
      timestamp: new Date().toISOString(),
    });
  }

  // Validate and sanitize image inputs (max 5 images, must be valid media types)
  const ALLOWED_MEDIA_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'] as const;
  const validatedImages: ClaudeImageInput[] = [];
  if (images && Array.isArray(images)) {
    for (const img of images.slice(0, 5)) {
      if (
        img.base64 &&
        typeof img.base64 === 'string' &&
        ALLOWED_MEDIA_TYPES.includes(img.media_type as any)
      ) {
        validatedImages.push({
          base64: img.base64,
          media_type: img.media_type as ClaudeImageInput['media_type'],
        });
      }
    }
  }

  // Fetch the existing draft
  const { data: draft, error: fetchErr } = await sb()
    .from('agent_drafts')
    .select('*')
    .eq('id', id)
    .eq('agent_type', 'marketing')
    .single();

  if (fetchErr || !draft) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: `Draft ${id} not found` },
      timestamp: new Date().toISOString(),
    });
  }

  const content = draft.content as Record<string, unknown>;
  const draftForRetry = {
    channel: draft.channel as AgentChannel,
    language: draft.language as AgentLanguage,
    body: (content.body as string) ?? '',
    hashtags: (content.hashtags as string[]) ?? [],
    image_brief: content.image_brief as string | undefined,
    image_html: content.image_html as string | undefined,
    pillar: content.pillar as string | undefined,
  };

  try {
    // Use the retry mechanism with human instructions as the "error reasons"
    const result = await retryBlockedDraft(
      draftForRetry,
      [`human_correction: ${instructions.trim()}`],
      (corrected) => {
        // Validate the corrected draft through guardrails
        const check = runGuardrails({
          agentType: 'marketing',
          channel: corrected.channel,
          language: corrected.language,
          content: {
            body: corrected.body,
            hashtags: corrected.hashtags,
            image_html: corrected.image_html,
          },
        });
        return check;
      },
      validatedImages.length > 0 ? validatedImages : undefined
    );

    if (!result.corrected) {
      return res.status(422).json({
        error: {
          code: 'CORRECTION_FAILED',
          message: 'Could not produce a valid correction after retries',
        },
        attempts: result.attempts,
        cost_usd: result.cost_usd,
        timestamp: new Date().toISOString(),
      });
    }

    // Update the draft in DB with corrected content
    const correctedContent = {
      body: result.corrected.body,
      hashtags: result.corrected.hashtags,
      image_brief: result.corrected.image_brief,
      image_html: result.corrected.image_html,
      pillar: result.corrected.pillar,
    };

    const { data: updated, error: updateErr } = await sb()
      .from('agent_drafts')
      .update({
        content: correctedContent,
        status: 'pending_review',
        reject_reason: null,
      })
      .eq('id', id)
      .select('id, status, content, channel, language')
      .single();

    if (updateErr) {
      return res.status(500).json({
        error: { code: 'DB_ERROR', message: updateErr.message },
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      draft: updated,
      correction: {
        attempts: result.attempts,
        tokens_input: result.tokens_input,
        tokens_output: result.tokens_output,
        cost_usd: result.cost_usd,
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: { code: 'CORRECTION_ERROR', message: (err as Error).message },
      timestamp: new Date().toISOString(),
    });
  }
}
