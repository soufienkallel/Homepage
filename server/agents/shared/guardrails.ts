// Guardrails for agent-generated drafts.
// See doc/requirements/mallouliauto_agents_specifications.md §6
// Enforces .github/instructions/agents.instructions.md §4.7 (French accents)
// and §4.8 / §4.8.1 (no third-party vendor names in user-visible text).

import type { AgentChannel, AgentLanguage, DraftContent, GuardrailReport } from './types.js';
import { PUBLIC_PRICES_TND } from '../../../src/data/pricing.js';

const BANNED_VENDOR_NAMES = [
  'PAVE',
  'DeepSeek',
  'Groq',
  'Exypnos',
  'XAI',
  'Anthropic',
  'Claude',
  'OpenAI',
];

// Subset of common French words from §4.7 that must be accented in user-visible text.
// If the unaccented form appears as a standalone word, we block.
const REQUIRED_FRENCH_ACCENT_PAIRS: Array<{ wrong: RegExp; correct: string }> = [
  { wrong: /\bVehicule\b/i, correct: 'Véhicule' },
  { wrong: /\bRevision\b/i, correct: 'Révision' },
  { wrong: /\bReparation\b/i, correct: 'Réparation' },
  { wrong: /\bControle\b/i, correct: 'Contrôle' },
  { wrong: /\bExpiree\b/i, correct: 'Expirée' },
  { wrong: /\bDepassee\b/i, correct: 'Dépassée' },
  { wrong: /\bdefaillant\b/i, correct: 'défaillant' },
  { wrong: /\bdefaut\b/i, correct: 'défaut' },
  { wrong: /\bCout\b/i, correct: 'Coût' },
  { wrong: /\bperiodique\b/i, correct: 'périodique' },
  { wrong: /\bintermediaire\b/i, correct: 'intermédiaire' },
  { wrong: /\breglementaire\b/i, correct: 'réglementaire' },
  { wrong: /\bGeometrie\b/i, correct: 'Géométrie' },
  { wrong: /\bDisponibilite\b/i, correct: 'Disponibilité' },
  { wrong: /\bGeneration\b/i, correct: 'Génération' },
  { wrong: /\bDetection\b/i, correct: 'Détection' },
  { wrong: /\bEchappement\b/i, correct: 'Échappement' },
  { wrong: /\bPrecision\b/i, correct: 'Précision' },
  { wrong: /\bsante\b/i, correct: 'santé' },
  { wrong: /\bCitroen\b/i, correct: 'Citroën' },
];

const ALLOWED_URL_HOSTS = [
  'mallouliauto.com',
  'www.mallouliauto.com',
  'platform.mallouliauto.com',
  'cal.com',
  'calendar.zoho.com',
  'wa.me',
];

const EMOJI_REGEX = /\p{Extended_Pictographic}/u;
// Owner decisions: no price in a draft (25 Sept 2026), except the public prices
// published on /tarifs (1–2 Oct 2026, grid of 16 Oct 2026, src/data/pricing.js).
// Any other amount — travel fee, volume price, commission — is blocked.
const PRICE_REGEX = /(\d[\d\s.,]*)\s?(?:TND|DT|dinars?)\b/gi;
const PUBLIC_PRICES = new Set(PUBLIC_PRICES_TND);

/** True when the text names an amount in dinars other than a public price. */
export function containsNonPublicPrice(text: string): boolean {
  for (const match of text.matchAll(PRICE_REGEX)) {
    const digits = match[1].replace(/[\s.,]/g, '');
    if (!PUBLIC_PRICES.has(Number(digits))) return true;
  }
  return false;
}
const URL_REGEX = /https?:\/\/([^\s/]+)([^\s)]*)/gi;

const SALES_LENGTH_LIMITS: Partial<Record<AgentChannel, number>> = {
  email: 120,
  linkedin_dm: 60,
  whatsapp: 40,
};

const SALES_CHANNELS: AgentChannel[] = ['email', 'linkedin_dm', 'whatsapp'];

export interface GuardrailInput {
  agentType: 'marketing' | 'sales';
  channel: AgentChannel;
  language: AgentLanguage;
  content: DraftContent;
  /** Required for sales drafts — the booking URL the CTA must contain. */
  calComDemoUrl?: string;
}

function visibleFields(content: DraftContent): string {
  return [
    content.subject ?? '',
    content.body ?? '',
    ...(content.hashtags ?? []),
    content.image_brief ?? '',
  ].join('\n');
}

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function runGuardrails(input: GuardrailInput): GuardrailReport {
  const warnings: string[] = [];
  const blocked_reasons: string[] = [];
  const text = visibleFields(input.content);

  // Rule 1 — no emojis, for every agent
  if (EMOJI_REGEX.test(text)) {
    blocked_reasons.push('contains_emoji');
  }

  // Rule 1b — no prices other than the public one
  if (containsNonPublicPrice(text)) {
    blocked_reasons.push('contains_price');
  }

  // Rule 2 — no third-party vendor names in user-visible text
  for (const name of BANNED_VENDOR_NAMES) {
    const re = new RegExp(`\\b${name}\\b`, 'i');
    if (re.test(text)) {
      blocked_reasons.push(`vendor_name:${name}`);
    }
  }

  // Rule 3 — French accents required when language='fr'
  if (input.language === 'fr') {
    for (const { wrong, correct } of REQUIRED_FRENCH_ACCENT_PAIRS) {
      if (wrong.test(text)) {
        blocked_reasons.push(`missing_accent:${correct}`);
      }
    }
  }

  // Rule 4 — URL whitelist
  const urlMatches = [...text.matchAll(URL_REGEX)];
  for (const m of urlMatches) {
    const host = (m[1] ?? '').toLowerCase();
    if (!ALLOWED_URL_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) {
      blocked_reasons.push(`url_not_whitelisted:${host}`);
    }
  }

  // Rule 5 — sales length caps (warn only)
  if (input.agentType === 'sales') {
    const limit = SALES_LENGTH_LIMITS[input.channel];
    if (limit !== undefined) {
      const wc = countWords(input.content.body);
      if (wc > limit) {
        warnings.push(`length_exceeds_limit:${input.channel}:${wc}/${limit}`);
      }
    }
  }

  // Rule 6 — sales must contain demo CTA URL
  if (input.agentType === 'sales' && SALES_CHANNELS.includes(input.channel)) {
    if (!input.calComDemoUrl) {
      blocked_reasons.push('missing_cal_com_demo_url_config');
    } else if (!input.content.body.includes(input.calComDemoUrl)) {
      blocked_reasons.push('missing_cta_demo_url');
    }
  }

  return {
    passed: blocked_reasons.length === 0,
    warnings,
    blocked_reasons,
  };
}
