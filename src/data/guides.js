/**
 * Guides (docs/specs/2026-10-guides.md): categories of the `guides` table and the
 * figures derived at display time. `GUIDE_CATEGORIES` mirrors the check constraint of
 * migration 20261002130000_articles_guides_fields.sql, extended by
 * 20261003130000_guides_category_protocole.sql — change both together.
 */

export const GUIDE_CATEGORIES = [
  { code: 'carrosserie', label: 'Carrosserie' },
  { code: 'pneus-freins', label: 'Pneus et freins' },
  { code: 'mecanique', label: 'Mécanique' },
  { code: 'documents', label: 'Documents' },
  { code: 'diagnostic', label: 'Diagnostic' },
  { code: 'protocole', label: 'Protocole' },
];

export const categoryLabel = (code) =>
  GUIDE_CATEGORIES.find((category) => category.code === code)?.label || '';

const WORDS_PER_MINUTE = 200;

/** Reading time in minutes (at least 1), from the Markdown body. */
export const readingMinutes = (body) => {
  const words = String(body || '')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

/** « 2 octobre 2026 » from a `date` column value (YYYY-MM-DD), or '' when absent. */
export const formatReviewedDate = (reviewedAt) => {
  if (!reviewedAt) return '';
  const date = new Date(`${reviewedAt}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};
