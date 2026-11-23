import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import SEO from '../components/SEO';
import GuideCard from '../components/GuideCard';
import InspectionCTA from '../components/InspectionCTA';
import { GUIDE_CATEGORIES } from '../data/guides';
import { supabase } from '../lib/supabase';
import { adminFetch } from '../lib/adminApi';
import { useStore } from '../store/useStore';
import {
  createGuide,
  updateGuide,
  deleteGuide,
  listGuides,
  uploadGuideImage,
  IMAGE_MAX_BYTES,
} from '../lib/guideService';

const COLOR_OPTIONS = [
  { name: 'Orange', code: 'orange', hex: 'var(--color-brand-orange)' },
  { name: 'Bleu', code: 'blue', hex: 'var(--color-brand-blue)' },
  { name: 'Marine', code: 'navy', hex: 'var(--color-brand-navy)' },
  { name: 'Vert', code: 'green', hex: 'var(--color-emerald)' },
];

const EMPTY_FORM = {
  title: '',
  publicationDate: '',
  coverPhotoUrl: '',
  body: '',
  excerpt: '',
  slug: '',
  category: '',
  reviewedAt: '',
  status: 'draft',
};

export default function Guides() {
  const location = useLocation();
  const isAdmin = useStore((state) => state.isAdmin);
  const initializeAuth = useStore((state) => state.initializeAuth);
  const isHomepageAdminRoute = location.pathname.startsWith('/admin');
  const [guides, setGuides] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isLoadingGuides, setIsLoadingGuides] = useState(true);
  const [actionError, setActionError] = useState('');
  const [siteNotice, setSiteNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const markdownRef = useRef(null);
  const editorRef = useRef(null);

  const getExcerpt = (markdown) =>
    markdown
      .replace(/(#|\*|_|>|`|\[|\]|\(|\)|~|-)/g, '')
      .replace(/\n+/g, ' ')
      .trim()
      .slice(0, 140);

  const encodeCustomMarkdown = (markdown) =>
    markdown
      .replace(
        /\[color=(\w+)\]([\s\S]*?)\[\/color\]/g,
        (match, colorName, content) => `@@COLOR_START:${colorName}@@${content}@@COLOR_END@@`
      )
      .replace(/\[u\]([\s\S]*?)\[\/u\]/g, '@@UNDERLINE_START@@$1@@UNDERLINE_END@@');

  const restoreCustomMarkdown = (html) =>
    html
      .replace(/@@COLOR_START:(\w+)@@/g, (match, colorName) => {
        const color =
          COLOR_OPTIONS.find((item) => item.code === colorName)?.hex || 'var(--color-brand-navy)';
        return `<span style="color: ${color};">`;
      })
      .replace(/@@COLOR_END@@/g, '</span>')
      .replace(
        /@@UNDERLINE_START@@/g,
        '<span style="text-decoration: underline; text-decoration-color: currentColor; text-decoration-thickness: 2px;">'
      )
      .replace(/@@UNDERLINE_END@@/g, '</span>');

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    async function fetchGuides() {
      try {
        setIsLoadingGuides(true);
        // The admin editor lists drafts too (row-level security only lets admins read them).
        const { guides: liveGuides } = await listGuides(supabase, {
          status: isHomepageAdminRoute ? null : 'published',
          limit: 100,
        });
        setGuides(liveGuides);
      } catch (error) {
        console.error('Failed to load guides', error);
        setActionError('Impossible de charger les guides pour le moment.');
        setGuides([]);
      } finally {
        setIsLoadingGuides(false);
      }
    }

    fetchGuides();
  }, [isHomepageAdminRoute]);

  useEffect(() => {
    if (!isOpen || !markdownRef.current || !window.EasyMDE) {
      return undefined;
    }

    editorRef.current = new window.EasyMDE({
      element: markdownRef.current,
      initialValue: formState.body,
      toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'upload-image',
        '|',
        {
          name: 'color',
          action: (editor) => {
            const html = COLOR_OPTIONS.map(
              (color) =>
                `<button class="color-btn" data-color="${color.code}" style="background:${color.hex}; width:28px; height:28px; border-radius:4px; border:1px solid var(--color-brand-gray); cursor:pointer; margin:2px;" title="${color.name}"></button>`
            ).join('');
            document.getElementById('color-picker-popup')?.remove();
            const container = document.createElement('div');
            container.innerHTML = html;
            container.style.flexWrap = 'wrap';
            container.style.gap = '4px';
            container.style.padding = '8px';
            container.style.background = 'white';
            container.style.border = '1px solid var(--color-brand-gray)';
            container.style.borderRadius = '4px';
            container.style.position = 'fixed';
            container.style.zIndex = '10000';
            container.style.width = '220px';
            container.style.top = '20vh';
            container.style.left = '50%';
            container.style.transform = 'translateX(-50%)';
            container.id = 'color-picker-popup';
            document.body.appendChild(container);
            container.querySelectorAll('.color-btn').forEach((btn) => {
              btn.addEventListener('click', (e) => {
                e.preventDefault();
                const color = btn.dataset.color;
                const selected = editor.codemirror.getSelection();
                const text = selected || 'texte coloré';
                editor.codemirror.replaceSelection(`[color=${color}]${text}[/color]`);
                container.remove();
              });
            });
          },
          className: 'fa fa-palette tool-palette-icon',
          title: 'Couleur du texte',
        },
        {
          name: 'underline',
          action: (editor) => {
            const selectedText = editor.codemirror.getSelection();
            const underlineText = selectedText ? `[u]${selectedText}[/u]` : '[u]texte souligné[/u]';
            editor.codemirror.replaceSelection(underlineText);
          },
          className: 'fa fa-underline',
          title: 'Souligner',
        },
        '|',
        'preview',
        'side-by-side',
      ],
      previewRender: (plainText) => {
        const encodedText = encodeCustomMarkdown(plainText);
        const markdownHtml = window.marked
          ? window.marked.parse(encodedText, { breaks: true })
          : encodedText.replace(/\n/g, '<br />');
        return restoreCustomMarkdown(markdownHtml);
      },
      // Images of the body go to the same bucket as covers (folder body/). The inserted
      // Markdown is ![](url): fill in the alternative text between the brackets.
      uploadImage: true,
      imageAccept: 'image/jpeg, image/png, image/webp',
      imageMaxSize: IMAGE_MAX_BYTES,
      imageUploadFunction: (file, onSuccess, onError) => {
        uploadGuideImage(supabase, file, 'body')
          .then(onSuccess)
          .catch((error) => onError(error?.message || 'Téléversement impossible.'));
      },
      imageTexts: {
        sbInit: 'Glissez une image ici ou utilisez le bouton image.',
        sbOnDragEnter: "Déposez l'image pour la téléverser.",
        sbOnDrop: "Téléversement de l'image…",
        sbProgress: 'Téléversement : #progress#',
        sbOnUploaded: 'Image téléversée.',
      },
      errorMessages: {
        noFileGiven: 'Aucun fichier sélectionné.',
        typeNotAllowed: 'Format non pris en charge : JPEG, PNG ou WebP.',
        fileTooLarge: 'Image trop lourde : 5 Mo au maximum.',
        importError: 'Téléversement impossible : #error#',
      },
      spellChecker: false,
      placeholder: 'Rédigez le contenu du guide ici...',
      renderingConfig: {
        singleLineBreaks: true,
      },
      codemirror: {
        lineWrapping: true,
      },
    });

    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea();
        editorRef.current = null;
      }
    };
  }, [isOpen, formState.body]);

  const createSlug = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const handleOpenForm = (guide = null) => {
    setActionError('');
    setImagePreviewError(false);
    if (guide) {
      setEditingId(guide.id);
      setFormState({
        title: guide.title,
        publicationDate: (guide.published_at || guide.created_at || '').slice(0, 10),
        coverPhotoUrl: guide.cover_image_url || '',
        body: guide.body || '',
        excerpt: guide.excerpt || '',
        slug: guide.slug || '',
        category: guide.category || '',
        reviewedAt: guide.reviewed_at || '',
        status: guide.status || 'draft',
      });
    } else {
      setEditingId(null);
      setFormState({ ...EMPTY_FORM, publicationDate: new Date().toISOString().split('T')[0] });
    }
    setIsOpen(true);
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setActionError('');
    setIsUploadingCover(true);
    try {
      const url = await uploadGuideImage(supabase, file, 'covers');
      handleInputChange('coverPhotoUrl', url);
      setImagePreviewError(false);
    } catch (error) {
      setActionError(`Téléversement impossible : ${error?.message || 'erreur inconnue'}`);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // A published guide is pre-rendered at build time (docs/specs/2026-10-prerendering.md):
  // publishing, editing or removing one rebuilds the site so its page and the sitemap follow.
  // Optional: without a deploy hook (503) or an API (local dev), nothing is shown and the
  // guide's share page follows the next deploy. Only a configured hook that fails is reported.
  const rebuildSite = async () => {
    try {
      const response = await adminFetch('/api/admin/redeploy', { method: 'POST' });
      if (response.ok) {
        setSiteNotice(
          'Mise à jour du site lancée : la page de partage du guide sera prête dans 2 à 3 minutes.'
        );
      } else if (response.status === 502) {
        setSiteNotice(
          'Guide enregistré. La mise à jour automatique du site a échoué : la page de partage du guide suivra le prochain déploiement.'
        );
      }
    } catch {
      // Network error: stay silent, the guide itself is saved.
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      setActionError('Accès refusé. Un compte administrateur authentifié est requis.');
      return;
    }

    if (formState.status === 'published' && !formState.reviewedAt) {
      setActionError(
        'Renseignez la date « Relu le » avant de publier : un guide non relu ne peut pas être publié.'
      );
      return;
    }

    setActionError('');
    setIsSaving(true);

    const body = editorRef.current ? editorRef.current.value() : formState.body;
    const description = formState.excerpt.trim() || getExcerpt(body);
    const slug = formState.slug || createSlug(formState.title);
    const published_at = formState.publicationDate
      ? new Date(formState.publicationDate).toISOString()
      : new Date().toISOString();

    const guideData = {
      title: formState.title,
      body,
      cover_image_url: formState.coverPhotoUrl || null,
      slug,
      author: null,
      excerpt: description,
      status: formState.status,
      category: formState.category || null,
      reviewed_at: formState.reviewedAt || null,
      published_at,
    };

    const wasPublished = guides.some(
      (guide) => guide.id === editingId && guide.status === 'published'
    );
    setSiteNotice('');

    try {
      if (editingId) {
        const updated = await updateGuide(supabase, editingId, guideData);
        setGuides((prev) => prev.map((guide) => (guide.id === editingId ? updated : guide)));
      } else {
        const created = await createGuide(supabase, guideData);
        setGuides((prev) => [created, ...prev]);
      }

      setFormState(EMPTY_FORM);
      setIsOpen(false);
      setEditingId(null);
      if (wasPublished || guideData.status === 'published') rebuildSite();
    } catch (error) {
      console.error('[Guides Save Error]:', error?.message || error, error);
      const msg = error?.message || error?.details || error?.hint || JSON.stringify(error);
      setActionError(`Erreur lors de l'enregistrement: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGuide = async (targetId) => {
    if (!isAdmin) {
      setActionError('Accès refusé. Un compte administrateur authentifié est requis.');
      return;
    }
    setConfirmDeleteId(targetId);
  };

  const confirmDelete = async () => {
    const targetId = confirmDeleteId;
    if (!targetId) return;

    setIsDeleting(true);
    setActionError('');
    setSiteNotice('');
    const wasPublished = guides.some(
      (guide) => guide.id === targetId && guide.status === 'published'
    );

    try {
      await deleteGuide(supabase, targetId);
      setGuides((prev) => prev.filter((guide) => guide.id !== targetId));
      if (wasPublished) rebuildSite();
    } catch (error) {
      console.error('[Guides Delete Error]:', error?.message || error, error);
      const detailedMessage =
        error?.message ||
        error?.details ||
        error?.hint ||
        (typeof error === 'string' ? error : JSON.stringify(error));
      setActionError(`Erreur de suppression: ${detailedMessage}`);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const visibleGuides = categoryFilter
    ? guides.filter((guide) => guide.category === categoryFilter)
    : guides;
  const usedCategories = GUIDE_CATEGORIES.filter((category) =>
    guides.some((guide) => guide.category === category.code)
  );
  const showAdmin = isAdmin && isHomepageAdminRoute;

  return (
    <main className="min-h-screen">
      <SEO
        title="Guides"
        description="Guides pour acheter une voiture d'occasion en Tunisie : contrôler les pneus, repérer une peinture refaite, vérifier les papiers. Des repères pour choisir, pas un substitut à l'inspection."
        path="/guides"
        noIndex={isHomepageAdminRoute}
      />

      <section className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#f0a184] mb-4">
            MALLOULIAUTO
          </p>
          <h1 className="text-4xl lg:text-5xl font-semibold leading-tight mb-6 max-w-3xl">
            Guides
          </h1>
          <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
            {showAdmin
              ? "Rédiger, relire et publier les guides. Un guide ne peut être publié qu'avec sa date de relecture."
              : "Apprenez à repérer les défauts d'une voiture d'occasion avant d'acheter. Ces contrôles aident à choisir ; ils ne remplacent pas une inspection complète."}
          </p>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {usedCategories.length > 1 && !showAdmin ? (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
                {[{ code: '', label: 'Tous' }, ...usedCategories].map((category) => (
                  <button
                    key={category.code}
                    type="button"
                    aria-pressed={categoryFilter === category.code}
                    onClick={() => setCategoryFilter(category.code)}
                    className={`border px-4 py-2 text-sm font-semibold transition-colors ${
                      categoryFilter === category.code
                        ? 'border-ink bg-ink text-white'
                        : 'border-rule-2 text-ink hover:border-ink'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            ) : (
              <div />
            )}

            {showAdmin && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="border border-rule px-5 py-3 font-mono text-xs uppercase tracking-wide text-ink-2">
                  {isLoadingGuides
                    ? 'Chargement des guides...'
                    : `${guides.length} guide${guides.length > 1 ? 's' : ''}`}
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenForm()}
                  className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-ink px-5 py-3 text-sm font-semibold text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un guide
                </button>
              </div>
            )}
          </div>

          {actionError && (
            <div className="mb-8 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {actionError}
            </div>
          )}

          {showAdmin && siteNotice && (
            <div role="status" className="mb-8 border border-rule-2 px-5 py-4 text-sm text-ink-2">
              {siteNotice}
            </div>
          )}

          {isLoadingGuides ? (
            <p className="text-ink-2 text-sm" role="status">
              Chargement des guides...
            </p>
          ) : actionError && guides.length === 0 ? null : visibleGuides.length === 0 ? (
            <div className="border border-rule px-7 py-16 text-center">
              <p className="text-ink-2 leading-relaxed max-w-md mx-auto mb-6">
                {showAdmin
                  ? 'Aucun guide pour le moment.'
                  : 'Les premiers guides arrivent bientôt. En attendant, vous pouvez demander une inspection.'}
              </p>
              {!showAdmin && (
                <Link
                  to="/demande-inspection"
                  className="inline-flex items-center justify-center bg-accent-ink hover:bg-ink px-6 py-3 text-sm font-bold transition-colors"
                >
                  <span className="text-white">Demander un diagnostic</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {visibleGuides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  isAdmin={showAdmin}
                  onEdit={() => handleOpenForm(guide)}
                  onDelete={() => handleDeleteGuide(guide.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {!showAdmin && (
        <InspectionCTA title="Vous préférez confier le contrôle à un professionnel ?" />
      )}

      {/* ── Confirm Delete Modal ─────────────────────────────────────────── */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm bg-white border border-rule p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-red-200">
              <svg
                className="w-7 h-7 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ink mb-2">Supprimer ce guide ?</h3>
            <p className="text-sm text-ink-2 mb-6">
              {guides.find((a) => a.id === confirmDeleteId)?.title || 'Ce guide'} sera supprimé
              définitivement.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                disabled={isDeleting}
                className="border border-rule-2 hover:border-ink bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 border border-red-600 bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
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
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {isDeleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="w-full max-w-4xl overflow-hidden bg-white border border-rule flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-rule px-8 py-6 flex-shrink-0">
              <div>
                <h3 className="text-2xl font-semibold text-ink">
                  {editingId ? 'Modifier le guide' : 'Ajouter un guide'}
                </h3>
              </div>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsOpen(false)}
                className="border border-rule-2 hover:border-ink px-4 py-2 text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-8 py-8 overflow-y-auto flex-1">
              {actionError && (
                <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-600 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse flex-shrink-0"></span>
                  <span>{actionError}</span>
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-ink-2 block">
                  Titre du guide
                  <input
                    value={formState.title}
                    onChange={(event) => handleInputChange('title', event.target.value)}
                    type="text"
                    placeholder="Titre du guide"
                    disabled={isSaving}
                    className="mt-1 w-full border border-rule bg-ground-2 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent-ink disabled:opacity-55"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm text-ink-2 block">
                  Date de publication
                  <input
                    value={formState.publicationDate}
                    onChange={(event) => handleInputChange('publicationDate', event.target.value)}
                    type="date"
                    disabled={isSaving}
                    className="mt-1 w-full border border-rule bg-ground-2 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent-ink disabled:opacity-55"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <label className="space-y-2 text-sm text-ink-2 block">
                  Catégorie
                  <select
                    value={formState.category}
                    onChange={(event) => handleInputChange('category', event.target.value)}
                    disabled={isSaving}
                    className="mt-1 w-full border border-rule bg-ground-2 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent-ink disabled:opacity-55"
                  >
                    <option value="">Aucune</option>
                    {GUIDE_CATEGORIES.map((category) => (
                      <option key={category.code} value={category.code}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-ink-2 block">
                  Relu le
                  <input
                    value={formState.reviewedAt}
                    onChange={(event) => handleInputChange('reviewedAt', event.target.value)}
                    type="date"
                    disabled={isSaving}
                    className="mt-1 w-full border border-rule bg-ground-2 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent-ink disabled:opacity-55"
                  />
                </label>
                <label className="space-y-2 text-sm text-ink-2 block">
                  Statut
                  <select
                    value={formState.status}
                    onChange={(event) => handleInputChange('status', event.target.value)}
                    disabled={isSaving}
                    className="mt-1 w-full border border-rule bg-ground-2 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent-ink disabled:opacity-55"
                  >
                    <option value="draft">Brouillon (non visible)</option>
                    <option value="published">Publié</option>
                  </select>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-ink-2 font-medium block">
                  Image de couverture (facultative, « Photo à venir » sinon)
                </label>
                <input
                  value={formState.coverPhotoUrl}
                  onChange={(event) => {
                    handleInputChange('coverPhotoUrl', event.target.value);
                    setImagePreviewError(false);
                  }}
                  type="text"
                  placeholder="https://... (photo réelle d'inspection MALLOULIAUTO)"
                  disabled={isSaving}
                  className="w-full border border-rule bg-ground-2 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent-ink disabled:opacity-55"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    className={`inline-flex cursor-pointer items-center border border-rule-2 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink ${
                      isSaving || isUploadingCover ? 'pointer-events-none opacity-55' : ''
                    }`}
                  >
                    {isUploadingCover ? 'Téléversement…' : 'Téléverser une image'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleCoverUpload}
                      disabled={isSaving || isUploadingCover}
                      className="sr-only"
                    />
                  </label>
                  <span className="text-xs text-ink-3">JPEG, PNG ou WebP · 5 Mo maximum</span>
                </div>
                {formState.coverPhotoUrl && (
                  <div className="mt-3 overflow-hidden border border-rule bg-ground-2">
                    {!imagePreviewError ? (
                      <img
                        src={formState.coverPhotoUrl}
                        alt="Aperçu"
                        className="w-full h-40 object-cover"
                        onError={() => setImagePreviewError(true)}
                        onLoad={() => setImagePreviewError(false)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 h-40 text-center px-4">
                        <svg
                          className="w-8 h-8 text-red-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-sm font-medium text-red-600">
                          Image introuvable ou URL invalide
                        </p>
                        <p className="text-xs text-ink-3">
                          Utilisez un lien direct vers une photo réelle MALLOULIAUTO (jamais une
                          banque d'images).
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-ink-3">
                  Utilisez une photo réelle d'inspection ou d'équipe MALLOULIAUTO — jamais une image
                  de banque.
                </p>
              </div>

              <label className="space-y-2 text-sm text-ink-2 block">
                Contenu du guide
                <textarea
                  ref={markdownRef}
                  defaultValue={formState.body}
                  rows={10}
                  className="mt-1 w-full min-h-[320px] border border-rule bg-ground-2 px-4 py-3 text-sm text-ink outline-none"
                />
                <p className="mt-1 text-xs text-ink-3">
                  Utilisez Markdown pour ajouter du contenu riche avec titres, listes, liens et
                  images.
                </p>
              </label>

              <label className="space-y-2 text-sm text-ink-2 block">
                Résumé (carte de la liste et résultat de recherche)
                <textarea
                  value={formState.excerpt}
                  onChange={(event) => handleInputChange('excerpt', event.target.value)}
                  rows={3}
                  maxLength={300}
                  disabled={isSaving}
                  className="mt-1 w-full border border-rule bg-ground-2 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent-ink disabled:opacity-55"
                />
                <p className="mt-1 text-xs text-ink-3">
                  Une à deux phrases. Si vous laissez ce champ vide, le début du texte est utilisé.
                </p>
              </label>

              <label className="space-y-2 text-sm text-ink-2 block">
                Slug d'URL (facultatif)
                <input
                  value={formState.slug}
                  onChange={(event) => handleInputChange('slug', event.target.value)}
                  type="text"
                  placeholder="controler-les-pneus"
                  disabled={isSaving}
                  className="mt-1 w-full border border-rule bg-ground-2 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent-ink disabled:opacity-55"
                />
                <p className="mt-1 text-xs text-ink-3">
                  Si vous laissez ce champ vide, le slug sera généré automatiquement à partir du
                  titre.
                </p>
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end border-t border-rule pt-6">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsOpen(false)}
                  className="border border-rule-2 hover:border-ink bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-accent hover:bg-accent-ink px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                >
                  {isSaving ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
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
                      Enregistrement...
                    </>
                  ) : editingId ? (
                    'Mettre à jour'
                  ) : (
                    'Enregistrer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
