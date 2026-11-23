import { useCallback, useEffect, useState, type ComponentType } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Facebook,
  Image as ImageIcon,
  Instagram,
  Linkedin,
  Megaphone,
  Paperclip,
  Pencil,
  Play,
  RefreshCw,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApi as api, adminFetch } from '../../lib/adminApi';

type Draft = {
  id: string;
  channel: string;
  language: string;
  status: string;
  content: {
    body: string;
    hashtags?: string[];
    image_brief?: string;
    image_prompt?: string;
    image_html?: string;
    image_spec?: {
      template: string;
      headline: string;
      subheadline?: string;
    };
    pillar?: string;
    subject?: string;
  };
  guardrails: {
    passed: boolean;
    warnings: string[];
    blocked_reasons: string[];
  } | null;
  reject_reason: string | null;
  created_at: string;
};

type StatusFilter = 'pending_review' | 'approved' | 'rejected';

type AttachedImage = {
  base64: string;
  media_type: string;
  name: string;
};

const CHANNEL_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
};

const CHANNEL_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  instagram: 'Instagram',
};

const PILLAR_LABELS: Record<string, string> = {
  product_education: 'Produit',
  customer_story: 'Client',
  market_data: 'Marché',
  partner_ecosystem: 'Partenaires',
  recruitment: 'Recrutement',
};

function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
}

function ogImagePath(draftId: string, version?: number) {
  const query = new URLSearchParams({ draftId });
  if (version !== undefined) query.set('v', String(version));
  return `/api/agents/marketing/og-image?${query.toString()}`;
}

/**
 * <img> cannot send an Authorization header, so the image is fetched with the
 * admin session and displayed from a blob URL (no token ever goes in a URL).
 */
function AdminImage({ path, alt, className }: { path: string; alt: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    setFailed(false);
    adminFetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`API ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  if (failed) {
    return <p className="text-xs text-brand-navy/70">Image indisponible.</p>;
  }
  if (!src) {
    return <p className="text-xs text-brand-navy/70">Chargement de l&apos;image…</p>;
  }
  return <img src={src} alt={alt} className={className} />;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString('fr-TN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function downloadImage(draftId: string) {
  adminFetch(ogImagePath(draftId))
    .then((res) => {
      if (!res.ok) throw new Error(`API ${res.status}`);
      return res.blob();
    })
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = `mallouliauto-${draftId.slice(0, 8)}.png`;
      anchor.click();
      URL.revokeObjectURL(blobUrl);
    })
    .catch((err) => window.alert(`Erreur téléchargement: ${(err as Error).message}`));
}

export default function HomepageAdminMarketingDrafts() {
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('pending_review');
  const [loading, setLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [imageVersion, setImageVersion] = useState(() => Date.now());

  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [campaignSegment, setCampaignSegment] = useState('all');
  const [campaignObjective, setCampaignObjective] = useState('awareness');
  const [campaignChannels, setCampaignChannels] = useState<string[]>([
    'linkedin',
    'facebook',
    'instagram',
  ]);
  const [campaignLanguages, setCampaignLanguages] = useState<string[]>(['fr']);
  const [campaignPillars, setCampaignPillars] = useState<string[]>([
    'product_education',
    'customer_story',
    'market_data',
    'partner_ecosystem',
    'recruitment',
  ]);
  const [campaignDraftCount, setCampaignDraftCount] = useState(5);

  const [correctDraftId, setCorrectDraftId] = useState<string | null>(null);
  const [correctInstructions, setCorrectInstructions] = useState('');
  const [correctImages, setCorrectImages] = useState<AttachedImage[]>([]);
  const [correctLoading, setCorrectLoading] = useState(false);

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api(`/api/agents/marketing/drafts?status=${filter}&limit=100`);
      setDrafts(res.drafts ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const handleRun = async () => {
    setCampaignModalOpen(false);
    setRunLoading(true);

    try {
      const res = await api('/api/agents/marketing/run', {
        method: 'POST',
        body: JSON.stringify({
          draftCount: campaignDraftCount,
          channels: campaignChannels,
          languages: campaignLanguages,
          segment: campaignSegment,
          objective: campaignObjective,
          pillars: campaignPillars,
        }),
      });
      window.alert(
        `Génération terminée\n${res.drafts_created} brouillons créés, ${res.drafts_blocked} bloqués.\nCoût : $${res.cost_usd}`
      );
      await fetchDrafts();
    } catch (err) {
      window.alert(`Erreur: ${(err as Error).message}`);
    } finally {
      setRunLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api('/api/agents/marketing/approve', {
        method: 'POST',
        body: JSON.stringify({ id, action: 'approve' }),
      });
      setDrafts((prev) => prev.filter((draft) => draft.id !== id));
    } catch (err) {
      window.alert(`Erreur: ${(err as Error).message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await api('/api/agents/marketing/approve', {
        method: 'POST',
        body: JSON.stringify({ id, action: 'reject', reject_reason: 'Manual reject from admin' }),
      });
      setDrafts((prev) => prev.filter((draft) => draft.id !== id));
    } catch (err) {
      window.alert(`Erreur: ${(err as Error).message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopy = (draft: Draft) => {
    const text = [draft.content.body, '', (draft.content.hashtags ?? []).join(' ')]
      .join('\n')
      .trim();
    copyToClipboard(text);
    setCopied(draft.id);
    window.setTimeout(() => setCopied(null), 1400);
  };

  const handlePickImages = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/gif,image/webp';
    input.multiple = true;

    input.onchange = () => {
      const files = input.files;
      if (!files) return;

      const maxFiles = 5 - correctImages.length;
      Array.from(files)
        .slice(0, maxFiles)
        .forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            if (base64) {
              setCorrectImages((prev) => [
                ...prev,
                { base64, media_type: file.type, name: file.name },
              ]);
            }
          };
          reader.readAsDataURL(file);
        });
    };

    input.click();
  };

  const handleCorrect = async () => {
    if (!correctDraftId || !correctInstructions.trim()) return;

    setCorrectLoading(true);
    try {
      const payload: Record<string, unknown> = {
        id: correctDraftId,
        instructions: correctInstructions.trim(),
      };

      if (correctImages.length > 0) {
        payload.images = correctImages.map((image) => ({
          base64: image.base64,
          media_type: image.media_type,
        }));
      }

      const res = await api('/api/agents/marketing/correct', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setDrafts((prev) =>
        prev.map((draft) =>
          draft.id === correctDraftId
            ? { ...draft, content: res.draft.content, status: res.draft.status }
            : draft
        )
      );

      setImageVersion(Date.now());
      setCorrectDraftId(null);
      setCorrectInstructions('');
      setCorrectImages([]);

      window.alert(
        `Correction appliquée\nCorrigé en ${res.correction.attempts} tentative(s). Coût : $${res.correction.cost_usd}`
      );
    } catch (err) {
      window.alert(`Erreur de correction: ${(err as Error).message}`);
    } finally {
      setCorrectLoading(false);
    }
  };

  const toggleOption = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((item) => item !== value) : [...arr, value];

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center gap-3 rounded-card border border-brand-gray bg-white p-5 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-gray text-brand-navy transition hover:bg-brand-gray/20"
          aria-label="Retour"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <Megaphone className="h-5 w-5 text-brand-orange" />
        <h1 className="text-xl font-bold text-brand-navy">Brouillons marketing</h1>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDrafts}
            className="inline-flex items-center gap-2 rounded-full border border-brand-gray px-3 py-2 text-sm font-medium text-brand-navy transition hover:bg-brand-gray/20"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>

          <button
            type="button"
            onClick={() => setCampaignModalOpen(true)}
            disabled={runLoading}
            className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-orange/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Play className="h-4 w-4" />
            {runLoading ? 'Génération...' : 'Générer'}
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {(['pending_review', 'approved', 'rejected'] as StatusFilter[]).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === status
                ? 'bg-brand-blue text-white'
                : 'border border-brand-gray bg-white text-brand-navy hover:bg-brand-gray/20'
            }`}
          >
            {status === 'pending_review'
              ? 'En attente'
              : status === 'approved'
                ? 'Approuvés'
                : 'Rejetés'}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-card border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-card border border-brand-gray bg-white p-10 shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-blue/20 border-t-brand-blue" />
          <p className="mt-3 text-center text-sm text-brand-navy/70">
            Chargement des brouillons...
          </p>
        </div>
      ) : drafts.length === 0 ? (
        <div className="rounded-card border border-brand-gray bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-brand-navy/70">Aucun brouillon pour ce statut.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => {
            const ChannelIcon = CHANNEL_ICONS[draft.channel] ?? Linkedin;
            const isActing = actionLoading === draft.id;
            const ogPath = ogImagePath(draft.id, imageVersion);

            return (
              <article
                key={draft.id}
                className="rounded-card border border-brand-gray bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <ChannelIcon className="h-4 w-4 text-brand-blue" />
                  <span className="text-xs font-semibold text-brand-navy">
                    {CHANNEL_LABELS[draft.channel] ?? draft.channel}
                  </span>
                  <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                    {(draft.language || '').toUpperCase()}
                  </span>
                  {draft.content.pillar ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {PILLAR_LABELS[draft.content.pillar] ?? draft.content.pillar}
                    </span>
                  ) : null}
                  <span className="ml-auto text-xs text-brand-navy/55">
                    {formatDate(draft.created_at)}
                  </span>
                </div>

                {draft.content.subject ? (
                  <h2 className="text-sm font-semibold text-brand-navy">{draft.content.subject}</h2>
                ) : null}
                <p className="mt-2 whitespace-pre-wrap text-sm text-brand-navy/85">
                  {draft.content.body}
                </p>

                {draft.content.hashtags && draft.content.hashtags.length > 0 ? (
                  <p className="mt-2 text-xs text-brand-blue">{draft.content.hashtags.join(' ')}</p>
                ) : null}

                {draft.content.image_spec || draft.content.image_html ? (
                  <div className="mt-3 rounded-lg border border-brand-gray/80 p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-brand-blue">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Image générée
                    </div>
                    <AdminImage
                      path={ogPath}
                      alt={draft.content.image_spec?.headline ?? 'Image marketing'}
                      className="w-full rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => downloadImage(draft.id)}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg border border-brand-gray px-3 py-1.5 text-xs font-medium text-brand-navy transition hover:bg-brand-gray/20"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Télécharger l'image
                    </button>
                  </div>
                ) : null}

                {draft.content.image_prompt ? (
                  <div className="mt-3 rounded-lg border border-brand-gray/80 bg-brand-gray/5 p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-brand-blue">
                      <Megaphone className="h-3.5 w-3.5" />
                      Prompt pour DALL-E / Gemini
                    </div>
                    <p className="whitespace-pre-wrap text-xs text-brand-navy/85">
                      {draft.content.image_prompt}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        copyToClipboard(draft.content.image_prompt || '');
                      }}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg border border-brand-gray px-3 py-1.5 text-xs font-medium text-brand-navy transition hover:bg-brand-gray/20"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copier le prompt
                    </button>
                  </div>
                ) : null}

                {draft.guardrails && !draft.guardrails.passed ? (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2">
                    <p className="text-xs font-semibold text-red-700">Bloqué par les garde-fous</p>
                    {draft.guardrails.blocked_reasons.map((reason, index) => (
                      <p key={`${draft.id}-reason-${index}`} className="text-xs text-red-700">
                        - {reason}
                      </p>
                    ))}
                  </div>
                ) : null}

                {draft.reject_reason ? (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
                    Raison du rejet : {draft.reject_reason}
                  </div>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(draft)}
                    className="inline-flex items-center gap-1 rounded-lg border border-brand-gray px-3 py-1.5 text-xs font-medium text-brand-navy transition hover:bg-brand-gray/20"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied === draft.id ? 'Copié' : 'Copier'}
                  </button>

                  {filter === 'pending_review' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setCorrectDraftId(draft.id);
                          setCorrectInstructions('');
                          setCorrectImages([]);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-brand-blue/40 bg-brand-blue/10 px-3 py-1.5 text-xs font-semibold text-brand-blue"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Corriger
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(draft.id)}
                        disabled={isActing}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <X className="h-3.5 w-3.5" />
                        Rejeter
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprove(draft.id)}
                        disabled={isActing}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approuver
                      </button>
                    </>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {campaignModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-card border border-brand-gray/60 bg-brand-navy p-5">
            <h2 className="text-lg font-semibold text-white">Paramètres de campagne</h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-white/90">
                Segment
                <select
                  value={campaignSegment}
                  onChange={(event) => setCampaignSegment(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white"
                >
                  {['all', 'insurance', 'garage', 'dealer', 'fleet', 'b2c'].map((segment) => (
                    <option key={segment} value={segment} className="bg-brand-navy text-white">
                      {segment}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-white/90">
                Objectif
                <select
                  value={campaignObjective}
                  onChange={(event) => setCampaignObjective(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white"
                >
                  {['awareness', 'lead_gen', 'conversion', 'engagement', 'recruitment'].map(
                    (objective) => (
                      <option
                        key={objective}
                        value={objective}
                        className="bg-brand-navy text-white"
                      >
                        {objective}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-white/90">Plateformes</p>
              <div className="flex flex-wrap gap-2">
                {['linkedin', 'facebook', 'instagram'].map((channel) => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => setCampaignChannels((prev) => toggleOption(prev, channel))}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      campaignChannels.includes(channel)
                        ? 'bg-brand-blue text-white'
                        : 'border border-white/20 bg-white/10 text-white/85'
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-white/90">Langues</p>
              <div className="flex flex-wrap gap-2">
                {['fr', 'en', 'ar'].map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => setCampaignLanguages((prev) => toggleOption(prev, language))}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      campaignLanguages.includes(language)
                        ? 'bg-brand-blue text-white'
                        : 'border border-white/20 bg-white/10 text-white/85'
                    }`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-white/90">Piliers</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'product_education',
                  'customer_story',
                  'market_data',
                  'partner_ecosystem',
                  'recruitment',
                ].map((pillar) => (
                  <button
                    key={pillar}
                    type="button"
                    onClick={() => setCampaignPillars((prev) => toggleOption(prev, pillar))}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      campaignPillars.includes(pillar)
                        ? 'bg-brand-blue text-white'
                        : 'border border-white/20 bg-white/10 text-white/85'
                    }`}
                  >
                    {pillar}
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-4 block text-sm text-white/90">
              Nombre de brouillons
              <input
                type="number"
                min={1}
                max={15}
                value={campaignDraftCount}
                onChange={(event) =>
                  setCampaignDraftCount(Math.max(1, Math.min(15, Number(event.target.value) || 1)))
                }
                className="mt-1 w-28 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white"
              />
            </label>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCampaignModalOpen(false)}
                className="rounded-lg border border-white/25 px-4 py-2 text-sm font-medium text-white/85"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleRun}
                disabled={
                  campaignChannels.length === 0 ||
                  campaignLanguages.length === 0 ||
                  campaignPillars.length === 0
                }
                className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Lancer
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {correctDraftId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-card border border-brand-gray/60 bg-brand-navy p-5">
            <h2 className="text-lg font-semibold text-white">Corriger le brouillon</h2>
            <p className="mt-1 text-sm text-white/70">Décrivez les corrections à appliquer.</p>

            <textarea
              value={correctInstructions}
              onChange={(event) => setCorrectInstructions(event.target.value)}
              rows={6}
              placeholder="Ex: raccourcir le texte à 2 phrases"
              className="mt-4 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white"
            />

            <div className="mt-4">
              <button
                type="button"
                onClick={handlePickImages}
                disabled={correctImages.length >= 5}
                className="inline-flex items-center gap-2 rounded-lg border border-brand-blue/40 bg-brand-blue/10 px-3 py-1.5 text-xs font-semibold text-brand-blue disabled:opacity-60"
              >
                <Paperclip className="h-3.5 w-3.5" />
                Joindre une image ({correctImages.length}/5)
              </button>
              {correctImages.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {correctImages.map((image, index) => (
                    <span
                      key={`${image.name}-${index}`}
                      className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-xs text-white/85"
                    >
                      {image.name}
                      <button
                        type="button"
                        onClick={() =>
                          setCorrectImages((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="text-brand-orange"
                        aria-label="Retirer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCorrectDraftId(null);
                  setCorrectInstructions('');
                  setCorrectImages([]);
                }}
                className="rounded-lg border border-white/25 px-4 py-2 text-sm font-medium text-white/85"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleCorrect}
                disabled={correctLoading || !correctInstructions.trim()}
                className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {correctLoading ? 'Correction...' : 'Corriger'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
