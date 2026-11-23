import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import InspectionCTA from '../components/InspectionCTA';
import GuideCard from '../components/GuideCard';
import { categoryLabel, formatReviewedDate, readingMinutes } from '../data/guides';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { getGuideBySlug, listGuides } from '../lib/guideService';
import { buildBreadcrumbList } from '../lib/seoSchema';

const COLOR_MAP = {
  orange: 'var(--color-brand-orange)',
  blue: 'var(--color-brand-blue)',
  navy: 'var(--color-brand-navy)',
  green: 'var(--color-emerald)',
};

const encodeCustomMarkdown = (markdown) =>
  markdown
    .replace(
      /\[color=(\w+)\]([\s\S]*?)\[\/color\]/g,
      (match, colorName, content) => `@@COLOR_START:${colorName}@@${content}@@COLOR_END@@`
    )
    .replace(/\[u\]([\s\S]*?)\[\/u\]/g, '@@UNDERLINE_START@@$1@@UNDERLINE_END@@');

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const restoreCustomMarkdown = (html) =>
  html
    .replace(/@@COLOR_START:(\w+)@@/g, (match, colorName) => {
      const color = COLOR_MAP[colorName] || 'var(--color-brand-navy)';
      return `<span style="color: ${color};">`;
    })
    .replace(/@@COLOR_END@@/g, '</span>')
    .replace(
      /@@UNDERLINE_START@@/g,
      '<span style="text-decoration: underline; text-decoration-color: currentColor; text-decoration-thickness: 2px;">'
    )
    .replace(/@@UNDERLINE_END@@/g, '</span>');

const parseMarkdownBody = (markdown) => {
  const source = escapeHtml(markdown || '');
  const encodedSource = encodeCustomMarkdown(source);
  const html =
    typeof window !== 'undefined' && window.marked
      ? window.marked.parse(encodedSource, { breaks: true })
      : encodedSource.replace(/\n/g, '<br />');

  // Images of the body load lazily: the instrument grid of the protocol guide holds many.
  return restoreCustomMarkdown(html).replace(/<img /g, '<img loading="lazy" decoding="async" ');
};

// Open Graph and JSON-LD need absolute image URLs; a cover may be a path of the site.
const absoluteUrl = (url) =>
  url ? (url.startsWith('/') ? `https://mallouliauto.com${url}` : url) : undefined;

export default function Guide() {
  const { slug } = useParams();
  const [guide, setGuide] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const isAdmin = useStore((state) => state.isAdmin);
  const initializeAuth = useStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    async function loadGuide() {
      try {
        setIsLoading(true);
        // Row-level security hides drafts from visitors; an admin may preview one.
        const guide = await getGuideBySlug(supabase, slug);
        setGuide(guide && (guide.status === 'published' || isAdmin) ? guide : null);
      } catch (err) {
        console.error('Failed to load guide', err);
        setGuide(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadGuide();
  }, [slug, isAdmin]);

  useEffect(() => {
    if (!guide) return undefined;
    let cancelled = false;
    listGuides(supabase, { limit: 12 })
      .then(({ guides }) => {
        if (cancelled) return;
        const others = guides.filter((item) => item.slug !== guide.slug);
        const sameCategory = others.filter((item) => item.category === guide.category);
        const rest = others.filter((item) => item.category !== guide.category);
        setRelated([...sameCategory, ...rest].slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      });
    return () => {
      cancelled = true;
    };
  }, [guide]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center py-20">
        <SEO title="Chargement…" path={`/guides/${slug}`} noIndex />
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-accent-ink mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-ink-2 text-sm">Chargement du guide...</p>
        </div>
      </main>
    );
  }

  if (!guide) {
    return (
      <main className="min-h-screen py-20">
        <SEO title="Guide introuvable" path={`/guides/${slug}`} noIndex />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-semibold text-ink mb-6">Guide introuvable</h1>
          <p className="text-ink-2 mb-8">
            Le guide demandé n'existe pas ou n'est plus disponible. Revenez aux guides pour
            découvrir les autres publications.
          </p>
          <Link
            to="/guides"
            className="inline-flex items-center justify-center bg-accent hover:bg-accent-ink px-6 py-3 text-sm font-semibold transition-colors"
          >
            <span className="text-white">Retour aux guides</span>
          </Link>
        </div>
      </main>
    );
  }

  const category = categoryLabel(guide.category);
  const reviewed = formatReviewedDate(guide.reviewed_at);
  const meta = [category, `${readingMinutes(guide.body)} min de lecture`]
    .filter(Boolean)
    .join(' · ');

  return (
    <main className="min-h-screen">
      <SEO
        title={guide.title}
        description={guide.description}
        path={guide.url}
        type="article"
        image={absoluteUrl(guide.imageUrl)}
        noIndex={guide.status !== 'published'}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: guide.title,
            description: guide.description,
            image: absoluteUrl(guide.imageUrl),
            datePublished: guide.published_at || guide.created_at || undefined,
            dateModified: guide.reviewed_at || guide.published_at || undefined,
            author: { '@type': 'Organization', name: 'MALLOULIAUTO' },
            publisher: {
              '@type': 'Organization',
              name: 'MALLOULIAUTO',
              logo: { '@type': 'ImageObject', url: 'https://mallouliauto.com/favicon.svg' },
            },
            mainEntityOfPage: `https://mallouliauto.com${guide.url}`,
          },
          buildBreadcrumbList([
            { name: 'Accueil', path: '/' },
            { name: 'Guides', path: '/guides' },
            { name: guide.title, path: guide.url },
          ]),
        ]}
      />

      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <nav aria-label="Fil d'Ariane" className="text-sm text-white/70 mb-6">
            <Link to="/" className="hover:text-white">
              Accueil
            </Link>
            {' › '}
            <Link to="/guides" className="hover:text-white">
              Guides
            </Link>
          </nav>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#f0a184] mb-4">
            {meta}
          </p>
          <h1 className="text-4xl lg:text-5xl font-semibold leading-tight mb-6">{guide.title}</h1>
          <p className="text-lg text-white/80 max-w-2xl leading-relaxed">{guide.description}</p>
          {reviewed && (
            <p className="mt-8 border-t border-white/15 pt-6 font-mono text-xs uppercase tracking-[0.14em] text-white/80">
              Relu le {reviewed}
            </p>
          )}
        </div>
      </section>

      <section className="py-16 bg-white border-t border-rule">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {guide.imageUrl && (
            <img
              src={guide.imageUrl}
              alt=""
              loading="lazy"
              className="w-full object-cover h-96 border border-rule mb-10"
            />
          )}
          <div
            className="guide-body"
            dangerouslySetInnerHTML={{
              __html: parseMarkdownBody(guide.body || guide.description),
            }}
          />
        </div>
      </section>

      {guide.category === 'protocole' ? (
        <aside aria-label="Devenir partenaire" className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-t border-rule py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <p className="text-xl lg:text-2xl font-semibold text-ink leading-snug">
                  Inspecteur ou expert ? Travaillez avec notre protocole.
                </p>
                <p className="text-sm text-ink-2 mt-1.5">
                  Instruments, application d&apos;inspection et rapport vérifiable, sous votre
                  responsabilité d&apos;expert.
                </p>
              </div>
              <Link
                to="/contact?type=partenaire"
                className="inline-flex items-center justify-center px-6 py-4 bg-accent-ink hover:bg-ink transition-colors"
              >
                <span className="text-white font-bold">Devenir partenaire</span>
              </Link>
            </div>
          </div>
        </aside>
      ) : null}

      <InspectionCTA
        title={
          guide.category === 'protocole'
            ? 'Faire inspecter un véhicule selon ce protocole'
            : 'Faire inspecter ce véhicule par un professionnel'
        }
      />

      {related.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold text-ink mb-8">Autres guides</h2>
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((item) => (
                <GuideCard key={item.id} guide={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
