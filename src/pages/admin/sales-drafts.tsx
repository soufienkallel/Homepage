import { useCallback, useEffect, useState, type ComponentType } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Linkedin,
  Mail,
  MessageCircle,
  Pencil,
  RefreshCw,
  Send,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminApi as api } from '../../lib/adminApi';

type SalesDraft = {
  id: string;
  channel: string;
  language: string;
  segment: string;
  status: string;
  prospect_id: string | null;
  content: {
    subject?: string;
    body: string;
  };
  guardrails: {
    passed: boolean;
    warnings: string[];
    blocked_reasons: string[];
  } | null;
  reject_reason: string | null;
  created_at: string;
};

type ProspectOption = {
  id: string;
  company: string;
  contact_name: string | null;
};

type StatusFilter = 'pending_review' | 'approved' | 'rejected';

const CHANNEL_LABELS: Record<string, string> = {
  email: 'Email',
  linkedin_dm: 'LinkedIn DM',
  whatsapp: 'WhatsApp',
};

const CHANNEL_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  email: Mail,
  linkedin_dm: Linkedin,
  whatsapp: MessageCircle,
};

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString('fr-TN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function copyToClipboard(text: string) {
  if (navigator.clipboard) navigator.clipboard.writeText(text);
}

export default function HomepageAdminSalesDrafts() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [drafts, setDrafts] = useState<SalesDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('pending_review');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedDrafts, setExpandedDrafts] = useState<Set<string>>(new Set());

  const [prospects, setProspects] = useState<ProspectOption[]>([]);
  const [prospectDropdownOpen, setProspectDropdownOpen] = useState(false);
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(
    searchParams.get('prospect_id')
  );

  const [correctingDraftId, setCorrectingDraftId] = useState<string | null>(null);
  const [correctionInstructions, setCorrectionInstructions] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api('/api/agents/sales/prospects?status=sequence_generated&limit=200');
        setProspects(
          (res.prospects ?? []).map((prospect: any) => ({
            id: prospect.id,
            company: prospect.company,
            contact_name: prospect.contact_name,
          }))
        );
      } catch {
        // Keep dropdown optional.
      }
    })();
  }, []);

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ status: filter, limit: '100' });
      if (selectedProspectId) params.set('prospect_id', selectedProspectId);
      const res = await api(`/api/agents/sales/drafts?${params}`);
      setDrafts(res.drafts ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filter, selectedProspectId]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api('/api/agents/sales/approve', {
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
      await api('/api/agents/sales/approve', {
        method: 'POST',
        body: JSON.stringify({ id, action: 'reject', reject_reason: 'Rejete manuellement' }),
      });
      setDrafts((prev) => prev.filter((draft) => draft.id !== id));
    } catch (err) {
      window.alert(`Erreur: ${(err as Error).message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCorrect = async (id: string) => {
    if (!correctionInstructions.trim()) return;

    setActionLoading(id);
    try {
      const res = await api('/api/agents/sales/correct', {
        method: 'POST',
        body: JSON.stringify({ id, instructions: correctionInstructions.trim() }),
      });

      setDrafts((prev) =>
        prev.map((draft) =>
          draft.id === id
            ? { ...draft, content: res.draft.content, guardrails: res.draft.guardrails }
            : draft
        )
      );

      setCorrectingDraftId(null);
      setCorrectionInstructions('');
    } catch (err) {
      window.alert(`Erreur de correction: ${(err as Error).message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopy = (draft: SalesDraft) => {
    const text = [
      draft.content.subject ? `Objet : ${draft.content.subject}` : '',
      '',
      draft.content.body,
    ]
      .join('\n')
      .trim();
    copyToClipboard(text);
    setCopied(draft.id);
    window.setTimeout(() => setCopied(null), 1400);
  };

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

        <TrendingUp className="h-5 w-5 text-brand-blue" />
        <h1 className="text-xl font-bold text-brand-navy">Brouillons sales</h1>

        <button
          type="button"
          onClick={fetchDrafts}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-brand-gray px-3 py-2 text-sm font-medium text-brand-navy transition hover:bg-brand-gray/20"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
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
                ? 'Approuves'
                : 'Rejetes'}
          </button>
        ))}
      </div>

      <div className="rounded-card border border-brand-gray bg-white p-3 shadow-sm">
        <button
          type="button"
          onClick={() => setProspectDropdownOpen((open) => !open)}
          className="flex w-full items-center gap-2 rounded-lg border border-brand-gray/80 px-3 py-2 text-left text-sm text-brand-navy"
        >
          <Users className="h-4 w-4 text-brand-blue" />
          <span className="flex-1 truncate">
            {selectedProspectId
              ? prospects.find((prospect) => prospect.id === selectedProspectId)?.company ||
                'Prospect selectionne'
              : 'Tous les prospects'}
          </span>
          {prospectDropdownOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {prospectDropdownOpen ? (
          <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-brand-gray/70">
            <button
              type="button"
              onClick={() => {
                setSelectedProspectId(null);
                setProspectDropdownOpen(false);
              }}
              className="w-full border-b border-brand-gray/60 px-3 py-2 text-left text-sm hover:bg-brand-gray/20"
            >
              Tous les prospects
            </button>
            {prospects.map((prospect) => (
              <button
                key={prospect.id}
                type="button"
                onClick={() => {
                  setSelectedProspectId(prospect.id);
                  setProspectDropdownOpen(false);
                }}
                className="block w-full border-b border-brand-gray/60 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-brand-gray/20"
              >
                <p className="text-brand-navy">{prospect.company}</p>
                {prospect.contact_name ? (
                  <p className="text-xs text-brand-navy/60">{prospect.contact_name}</p>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
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
          <p className="text-sm text-brand-navy/70">Aucun brouillon trouve.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => {
            const ChannelIcon = CHANNEL_ICONS[draft.channel] ?? Mail;
            const isExpanded = expandedDrafts.has(draft.id);
            const isActing = actionLoading === draft.id;

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
                    {draft.segment}
                  </span>
                  <span className="ml-auto text-xs text-brand-navy/55">
                    {formatDate(draft.created_at)}
                  </span>
                </div>

                {draft.content.subject ? (
                  <h2 className="text-sm font-semibold text-brand-navy">{draft.content.subject}</h2>
                ) : null}

                <button
                  type="button"
                  onClick={() =>
                    setExpandedDrafts((prev) => {
                      const next = new Set(prev);
                      if (next.has(draft.id)) next.delete(draft.id);
                      else next.add(draft.id);
                      return next;
                    })
                  }
                  className="mt-2 w-full text-left"
                >
                  <p
                    className="whitespace-pre-wrap text-sm text-brand-navy/85"
                    style={
                      isExpanded
                        ? undefined
                        : {
                            display: '-webkit-box',
                            WebkitLineClamp: 6,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }
                    }
                  >
                    {draft.content.body}
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-brand-navy/55">
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    {isExpanded ? 'Reduire' : 'Voir plus'}
                  </span>
                </button>

                {draft.guardrails && !draft.guardrails.passed ? (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2">
                    {draft.guardrails.blocked_reasons.map((reason, idx) => (
                      <p key={`${draft.id}-block-${idx}`} className="text-xs text-red-700">
                        {reason}
                      </p>
                    ))}
                  </div>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(draft)}
                    className="inline-flex items-center gap-1 rounded-lg border border-brand-gray px-3 py-1.5 text-xs font-medium text-brand-navy transition hover:bg-brand-gray/20"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied === draft.id ? 'Copie' : 'Copier'}
                  </button>

                  {filter === 'pending_review' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (correctingDraftId === draft.id) {
                            setCorrectingDraftId(null);
                            setCorrectionInstructions('');
                          } else {
                            setCorrectingDraftId(draft.id);
                            setCorrectionInstructions('');
                          }
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
                        className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-60"
                      >
                        <X className="h-3.5 w-3.5" />
                        Rejeter
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(draft.id)}
                        disabled={isActing}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 disabled:opacity-60"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approuver
                      </button>
                    </>
                  ) : null}
                </div>

                {correctingDraftId === draft.id ? (
                  <div className="mt-3 rounded-lg border border-brand-blue/30 bg-brand-blue/5 p-3">
                    <textarea
                      value={correctionInstructions}
                      onChange={(event) => setCorrectionInstructions(event.target.value)}
                      rows={3}
                      placeholder="Instructions de correction"
                      className="w-full rounded-lg border border-brand-gray/70 bg-white px-3 py-2 text-sm text-brand-navy"
                    />
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCorrectingDraftId(null);
                          setCorrectionInstructions('');
                        }}
                        className="rounded-lg border border-brand-gray px-3 py-1.5 text-xs font-medium text-brand-navy"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCorrect(draft.id)}
                        disabled={isActing || !correctionInstructions.trim()}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-blue px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Envoyer
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
