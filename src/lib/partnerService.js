/**
 * Partners of the site (docs/specs/2026-10-refonte-accueil.md §9; migration
 * 20261016100000_partners.sql). The public side reads the `partners_public` view (homepage
 * logos and published cards only); the admin reads and writes the `partners` table, which
 * row-level security reserves to admins.
 */

const PUBLIC_VIEW = 'partners_public';
const TABLE = 'partners';
const LOGO_BUCKET = 'partners';

export const PARTNER_TYPES = [
  { value: 'centre', label: 'Centre partenaire', plural: 'Centres partenaires' },
  { value: 'plateforme', label: 'Plateforme', plural: 'Plateformes' },
  { value: 'technologie', label: 'Technologie', plural: 'Technologie' },
];

/**
 * The fixed line of each card, by type. Not editable from the admin, so no card can claim
 * more than the relationship really is (no « certifié », « garanti », « indépendant »).
 */
export const RELATIONSHIP_LINE = {
  centre: 'Centre partenaire MALLOULIAUTO.',
  plateforme: 'Propose le diagnostic sur sa plateforme.',
  technologie: 'Fournit du matériel que nous utilisons.',
};

export const PROFILE_STATUSES = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'published', label: 'Publiée' },
  { value: 'archived', label: 'Archivée' },
];

export const LOGO_MAX_BYTES = 1024 * 1024;
const LOGO_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

/** Same formats as the table's checks, to give a clear message before saving. */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const PHONE_PATTERN = /^\+[1-9][0-9]{6,14}$/;
export const WEBSITE_PATTERN = /^https:\/\/\S+$/;

const throwIfError = ({ data, error }) => {
  if (error) throw error;
  return data;
};

/** « Tunisie », « Allemagne »… from an ISO code; the code itself if the browser can't name it. */
export function countryName(code) {
  if (!code) return '';
  try {
    return new Intl.DisplayNames(['fr'], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}

/** Homepage logos and published cards, in the admin's order. */
export async function listPublicPartners(supabase) {
  const rows = throwIfError(
    await supabase
      .from(PUBLIC_VIEW)
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
  );
  return rows || [];
}

/** Every partner, drafts and archived included (admins only). */
export async function listAllPartners(supabase) {
  const rows = throwIfError(
    await supabase
      .from(TABLE)
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
  );
  return rows || [];
}

export async function createPartner(supabase, values) {
  return throwIfError(await supabase.from(TABLE).insert(values).select('*').single());
}

export async function updatePartner(supabase, id, values) {
  return throwIfError(await supabase.from(TABLE).update(values).eq('id', id).select('*').single());
}

/**
 * Saves the list's order (the admin's up/down arrows): positions 1, 2, 3… Only the rows
 * whose position changed are written (one update each: no multi-row update with
 * different values).
 */
export async function savePartnerOrder(supabase, orderedPartners) {
  const changed = orderedPartners
    .map((partner, index) => ({ partner, position: index + 1 }))
    .filter(({ partner, position }) => partner.sort_order !== position);
  for (const { partner, position } of changed) {
    await updatePartner(supabase, partner.id, { sort_order: position });
  }
}

/**
 * Uploads a logo to the public `partners` bucket and returns its public URL. The checks
 * mirror the bucket's limits (1 MB, JPEG / PNG / WebP — no SVG); the bucket stays the
 * authority.
 */
export async function uploadPartnerLogo(supabase, file) {
  const extension = LOGO_TYPES[file.type];
  if (!extension) {
    throw new Error('Format non pris en charge : utilisez une image PNG, WebP ou JPEG.');
  }
  if (file.size > LOGO_MAX_BYTES) {
    throw new Error('Logo trop lourd : 1 Mo au maximum.');
  }
  // Random name: the original file name is never trusted or reused.
  const path = `logos/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: '31536000' });
  if (error) throw error;
  return supabase.storage.from(LOGO_BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Clicks sent to each partner over the last `days` days: { [slug]: { calls, links } }.
 * Reads public.homepage_click_counts(), which returns nothing for a non-admin.
 */
export async function partnerClickCounts(supabase, days = 30) {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  const rows = throwIfError(
    await supabase.rpc('homepage_click_counts', {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
    })
  );
  const counts = {};
  for (const row of rows || []) {
    if (row.name !== 'partner_call' && row.name !== 'partner_link') continue;
    const entry = counts[row.target] || { calls: 0, links: 0 };
    if (row.name === 'partner_call') entry.calls += Number(row.clicks);
    else entry.links += Number(row.clicks);
    counts[row.target] = entry;
  }
  return counts;
}
