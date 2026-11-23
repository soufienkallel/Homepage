import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Building,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApi as api } from '../../lib/adminApi';

type Prospect = {
  id: string;
  company: string;
  website: string | null;
  country: string | null;
  segment: string | null;
  status: string;
  score: number | null;
  owner: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_title: string | null;
  source: string | null;
  source_details: any;
  created_at: string;
  updated_at: string;
};

type Job = {
  id: string;
  job_type: string;
  status: string;
  input: any;
  error: string | null;
  attempts?: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

type SegmentConfig = {
  key: string;
  label: string;
  description?: string;
  enabled?: boolean;
};

type Filters = {
  status: string;
  segment: string;
  owner: string;
  q: string;
};

type DiscoverForm = {
  segment: string;
  ville: string;
  nombre: string;
};

type DiscoverBatchResult = {
  discovered: number;
  persisted: number;
  skipped: number;
  sample: any[];
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-slate-100 text-slate-700 border-slate-200',
  discovered: 'bg-blue-100 text-blue-700 border-blue-200',
  enriched: 'bg-purple-100 text-purple-700 border-purple-200',
  sequence_generated: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  in_progress: 'bg-orange-100 text-orange-700 border-orange-200',
  pending: 'bg-orange-100 text-orange-700 border-orange-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  // Job statuses (API returns: queued, running, completed, failed)
  queued: 'bg-orange-100 text-orange-700 border-orange-200',
  running: 'bg-blue-100 text-blue-700 border-blue-200',
};

function formatDate(iso?: string | null) {
  if (!iso) return '-';
  const date = new Date(iso);
  return date.toLocaleString('fr-TN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusClass(status: string) {
  return STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-700 border-slate-200';
}

function dedupe(values: Array<string | null | undefined>) {
  return [...new Set(values.filter(Boolean) as string[])];
}

export default function HomepageAdminSalesProspects() {
  const navigate = useNavigate();

  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [segmentConfigs, setSegmentConfigs] = useState<SegmentConfig[]>([]);

  const [loadingProspects, setLoadingProspects] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({ status: '', segment: '', owner: '', q: '' });

  const [discoverForm, setDiscoverForm] = useState<DiscoverForm>({
    segment: '',
    ville: '',
    nombre: '10',
  });

  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  const [jobExpanded, setJobExpanded] = useState<Set<string>>(new Set());
  const [bulkExpanded, setBulkExpanded] = useState<Set<string>>(new Set());

  const [discoverResult, setDiscoverResult] = useState<DiscoverBatchResult | null>(null);

  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [editForm, setEditForm] = useState<Partial<Prospect>>({});
  const [editLoading, setEditLoading] = useState(false);

  const [addingProspect, setAddingProspect] = useState(false);
  const [newProspectForm, setNewProspectForm] = useState<Partial<Prospect>>({
    segment: '',
    country: '',
    contact_name: '',
    contact_email: '',
  });
  const [addProspectLoading, setAddProspectLoading] = useState(false);
  const [workerLoading, setWorkerLoading] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);

  const loadProspects = useCallback(async () => {
    setLoadingProspects(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.segment) params.set('segment', filters.segment);
      if (filters.owner) params.set('owner', filters.owner);
      if (filters.q) params.set('q', filters.q);
      params.set('limit', '200');
      const res = await api(`/api/agents/sales/prospects?${params.toString()}`);
      setProspects(res.prospects ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingProspects(false);
    }
  }, [filters]);

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const res = await api('/api/agents/sales/jobs?limit=100');
      setJobs(res.jobs ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  const loadSegmentConfigs = useCallback(async () => {
    try {
      const res = await api('/api/agents/sales/discovery-config?entity=segments&limit=500');
      setSegmentConfigs(res.items ?? []);
    } catch {
      // Segment config is optional for this page.
    }
  }, []);

  useEffect(() => {
    loadProspects();
  }, [loadProspects]);

  useEffect(() => {
    loadJobs();
    loadSegmentConfigs();
  }, [loadJobs, loadSegmentConfigs]);

  const statusOptions = useMemo(
    () => dedupe(prospects.map((prospect) => prospect.status)),
    [prospects]
  );
  const segmentOptions = useMemo(
    () =>
      dedupe([
        ...prospects.map((prospect) => prospect.segment),
        ...segmentConfigs.map((config) => config.key),
      ]),
    [prospects, segmentConfigs]
  );
  const ownerOptions = useMemo(
    () => dedupe(prospects.map((prospect) => prospect.owner)),
    [prospects]
  );

  const hasActiveJobs = useMemo(
    () => jobs.some((job) => job.status !== 'completed' && job.status !== 'failed'),
    [jobs]
  );

  const addProspect = async () => {
    if (!newProspectForm.company?.trim()) {
      window.alert("Le nom de l'entreprise est requis.");
      return;
    }

    setAddProspectLoading(true);
    try {
      await api('/api/agents/sales/prospects', {
        method: 'POST',
        body: JSON.stringify({
          company: newProspectForm.company.trim(),
          segment: newProspectForm.segment || null,
          country: newProspectForm.country || null,
          owner: newProspectForm.owner || null,
          contact_name: newProspectForm.contact_name || null,
          contact_email: newProspectForm.contact_email || null,
          contact_title: newProspectForm.contact_title || null,
          whatsapp: (newProspectForm as any).whatsapp || null,
        }),
      });
      setAddingProspect(false);
      setNewProspectForm({});
      await loadProspects();
    } catch (err) {
      window.alert(`Erreur ajouter prospect: ${(err as Error).message}`);
    } finally {
      setAddProspectLoading(false);
    }
  };

  const discoverProspects = async () => {
    if (!discoverForm.segment.trim()) {
      window.alert('Le segment est requis.');
      return;
    }

    setDiscoverLoading(true);
    setDiscoverResult(null);

    try {
      const terms = [];
      if (discoverForm.ville.trim()) {
        terms.push(discoverForm.ville.trim());
      }

      const res = await api('/api/agents/sales/discover', {
        method: 'POST',
        body: JSON.stringify({
          segment: discoverForm.segment.trim(),
          countries: ['TN'],
          terms,
          pages: Number(discoverForm.nombre || '10'),
        }),
      });

      setDiscoverResult(res.result ?? null);
      await Promise.all([loadProspects(), loadJobs()]);
    } catch (err) {
      window.alert(`Erreur discover: ${(err as Error).message}`);
    } finally {
      setDiscoverLoading(false);
    }
  };

  const enrichProspect = async (prospectId: string) => {
    setActionLoading((prev) => ({ ...prev, [prospectId]: true }));
    try {
      await api('/api/agents/sales/enrich', {
        method: 'POST',
        body: JSON.stringify({ ids: [prospectId] }),
      });
      await loadProspects();
    } catch (err) {
      window.alert(`Erreur enrichir: ${(err as Error).message}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [prospectId]: false }));
    }
  };

  const generateDraft = async (prospectId: string) => {
    setActionLoading((prev) => ({ ...prev, [prospectId]: true }));
    try {
      await api(`/api/agents/sales/prospects/${prospectId}/generate`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      await loadProspects();
    } catch (err) {
      window.alert(`Erreur générer: ${(err as Error).message}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [prospectId]: false }));
    }
  };

  const deleteProspect = async (prospectId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce prospect ?')) return;

    setActionLoading((prev) => ({ ...prev, [prospectId]: true }));
    try {
      await api(`/api/agents/sales/prospects/${prospectId}`, {
        method: 'DELETE',
      });
      await loadProspects();
    } catch (err) {
      window.alert(`Erreur supprimer: ${(err as Error).message}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [prospectId]: false }));
    }
  };

  const startEditProspect = (prospect: Prospect) => {
    setEditingProspect(prospect);
    setEditForm({ ...prospect });
  };

  const saveEditProspect = async () => {
    if (!editingProspect) return;

    setEditLoading(true);
    try {
      await api(`/api/agents/sales/prospects/${editingProspect.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          company: editForm.company,
          segment: editForm.segment || null,
          country: editForm.country || null,
          owner: editForm.owner || null,
          contact_name: editForm.contact_name || null,
          contact_email: editForm.contact_email || null,
          contact_title: editForm.contact_title || null,
          whatsapp: (editForm as any).whatsapp || null,
        }),
      });
      setEditingProspect(null);
      await loadProspects();
    } catch (err) {
      window.alert(`Erreur modifier: ${(err as Error).message}`);
    } finally {
      setEditLoading(false);
    }
  };
  const runWorker = async () => {
    setWorkerLoading(true);
    try {
      await api('/api/agents/sales/worker', { method: 'POST', body: JSON.stringify({}) });
      await Promise.all([loadProspects(), loadJobs()]);
    } catch (err) {
      window.alert(`Erreur traiter file: ${(err as Error).message}`);
    } finally {
      setWorkerLoading(false);
    }
  };
  return (
    <section className="space-y-4">
      <header className="rounded-card border border-brand-gray bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-gray text-brand-navy transition hover:bg-brand-gray/20"
            aria-label="Retour"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Users className="h-5 w-5 text-brand-blue" />
          <h1 className="text-xl font-bold text-brand-navy">Prospects sales</h1>
          <button
            type="button"
            onClick={() => Promise.all([loadProspects(), loadJobs()])}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-brand-gray px-3 py-2 text-sm font-medium text-brand-navy transition hover:bg-brand-gray/20"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
        <button
          type="button"
          onClick={() => setAddingProspect(true)}
          className="inline-flex items-center justify-center gap-2 rounded-card border border-brand-gray bg-white px-4 py-3 text-sm font-semibold text-brand-navy shadow-sm hover:bg-brand-gray/5"
        >
          <Plus className="h-4 w-4 text-brand-blue" />
          Ajouter prospect
        </button>

        <button
          type="button"
          onClick={() => setShowDiscover((value) => !value)}
          className="inline-flex items-center justify-center gap-2 rounded-card border border-brand-gray bg-white px-4 py-3 text-sm font-semibold text-brand-navy shadow-sm"
        >
          <Search className="h-4 w-4 text-brand-blue" />
          Discover
        </button>
      </div>

      <button
        type="button"
        onClick={runWorker}
        disabled={workerLoading || hasActiveJobs}
        className="w-full inline-flex items-center justify-center gap-2 rounded-card border border-brand-gray bg-white px-4 py-3 text-sm font-semibold text-brand-navy shadow-sm hover:bg-brand-gray/5 disabled:opacity-60"
      >
        <Clock className="h-4 w-4 text-brand-blue" />
        {hasActiveJobs ? 'Traitement en cours...' : 'Traiter la file'}
      </button>

      {showDiscover ? (
        <div className="rounded-card border border-brand-gray bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-brand-navy">Découvrir des prospects</h2>
          <p className="mb-4 text-sm text-brand-gray">
            L'IA va rechercher des entreprises tunisiennes correspondant au segment.
          </p>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-brand-navy">Segment</label>
            <div className="flex flex-wrap gap-2">
              {['Assurance', 'Garage', 'Concessionnaire', 'Flotte'].map((seg) => (
                <button
                  key={seg}
                  type="button"
                  onClick={() => setDiscoverForm((prev) => ({ ...prev, segment: seg }))}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    discoverForm.segment === seg
                      ? 'bg-brand-blue text-white'
                      : 'border border-brand-gray bg-white text-brand-navy hover:bg-brand-gray/10'
                  }`}
                >
                  {seg}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="ville" className="mb-2 block text-sm font-medium text-brand-navy">
              Ville (optionnel)
            </label>
            <input
              id="ville"
              type="text"
              value={discoverForm.ville}
              onChange={(event) =>
                setDiscoverForm((prev) => ({ ...prev, ville: event.target.value }))
              }
              className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm"
              placeholder="Ex: Tunis, La Marsa, Sfax..."
            />
          </div>

          <div className="mb-4">
            <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-brand-navy">
              Nombre (max 20)
            </label>
            <input
              id="nombre"
              type="number"
              min={1}
              max={20}
              value={discoverForm.nombre}
              onChange={(event) =>
                setDiscoverForm((prev) => ({ ...prev, nombre: event.target.value }))
              }
              className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm"
              placeholder="10"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowDiscover(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-brand-gray px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-gray/5"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={discoverProspects}
              disabled={discoverLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Search className="h-4 w-4" />
              {discoverLoading ? 'Exécution...' : 'Découvrir'}
            </button>
          </div>

          {discoverResult ? (
            <div className="mt-4 rounded-lg border border-brand-gray/70 bg-brand-gray/10 p-3 text-sm text-brand-navy">
              <p>
                <strong>Découverts:</strong> {discoverResult.discovered}
              </p>
              <p>
                <strong>Persistés:</strong> {discoverResult.persisted}
              </p>
              <p>
                <strong>Ignorés:</strong> {discoverResult.skipped}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-card border border-brand-gray bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setShowFilters((open) => !open)}
          className="flex w-full items-center gap-2 text-left"
        >
          <span className="text-sm font-semibold text-brand-navy">Filtres</span>
          <span className="ml-auto">
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </button>

        {showFilters ? (
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              className="rounded-lg border border-brand-gray px-3 py-2 text-sm"
            >
              <option value="">Tous statuts</option>
              {statusOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <select
              value={filters.segment}
              onChange={(event) => setFilters((prev) => ({ ...prev, segment: event.target.value }))}
              className="rounded-lg border border-brand-gray px-3 py-2 text-sm"
            >
              <option value="">Tous segments</option>
              {segmentOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <select
              value={filters.owner}
              onChange={(event) => setFilters((prev) => ({ ...prev, owner: event.target.value }))}
              className="rounded-lg border border-brand-gray px-3 py-2 text-sm"
            >
              <option value="">Tous owners</option>
              {ownerOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <input
              value={filters.q}
              onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
              className="rounded-lg border border-brand-gray px-3 py-2 text-sm"
              placeholder="Recherche"
            />
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-card border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-brand-navy">Prospects ({prospects.length})</h2>

          {loadingProspects ? (
            <div className="rounded-card border border-brand-gray bg-white p-6 text-sm text-brand-navy/70">
              Chargement...
            </div>
          ) : prospects.length === 0 ? (
            <div className="rounded-card border border-brand-gray bg-white p-6 text-sm text-brand-navy/70">
              Aucun prospect.
            </div>
          ) : (
            prospects.map((prospect) => (
              <article
                key={prospect.id}
                className="rounded-card border border-brand-gray bg-white p-3 shadow-sm"
              >
                <div className="flex items-start gap-2">
                  <Building className="mt-0.5 h-4 w-4 text-brand-blue" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-brand-navy">
                        {prospect.company}
                      </h3>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusClass(prospect.status)}`}
                      >
                        {prospect.status}
                      </span>
                      {typeof prospect.score === 'number' ? (
                        <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                          Score {prospect.score}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 text-xs text-brand-navy/60">
                      {prospect.segment ?? '-'} · {prospect.country ?? '-'}
                    </p>

                    <div className="mt-2 text-xs text-brand-navy/70">
                      <p>ID: {prospect.id}</p>
                      {prospect.contact_name ? <p>Contact: {prospect.contact_name}</p> : null}
                      {prospect.contact_email ? <p>Email: {prospect.contact_email}</p> : null}
                      {prospect.owner ? <p>Owner: {prospect.owner}</p> : null}
                      <p>Maj: {formatDate(prospect.updated_at)}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditProspect(prospect)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-gray px-2.5 py-1.5 text-xs font-medium text-brand-navy hover:bg-brand-gray/10"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => enrichProspect(prospect.id)}
                        disabled={actionLoading[prospect.id]}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-gray px-2.5 py-1.5 text-xs font-medium text-brand-navy hover:bg-brand-gray/10 disabled:opacity-60"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {actionLoading[prospect.id] ? 'Enrichir...' : 'Enrichir'}
                      </button>
                      <button
                        type="button"
                        onClick={() => generateDraft(prospect.id)}
                        disabled={actionLoading[prospect.id]}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-2.5 py-1.5 text-xs font-medium text-white hover:bg-brand-blue/90 disabled:opacity-60"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {actionLoading[prospect.id] ? 'G\u00e9n\u00e9rer...' : 'G\u00e9n\u00e9rer'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProspect(prospect.id)}
                        disabled={actionLoading[prospect.id]}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-brand-navy">Jobs ({jobs.length})</h2>

          {loadingJobs ? (
            <div className="rounded-card border border-brand-gray bg-white p-6 text-sm text-brand-navy/70">
              Chargement...
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-card border border-brand-gray bg-white p-6 text-sm text-brand-navy/70">
              Aucun job.
            </div>
          ) : (
            jobs.map((job) => {
              const isOpen = jobExpanded.has(job.id);
              return (
                <article
                  key={job.id}
                  className="rounded-card border border-brand-gray bg-white p-3 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setJobExpanded((prev) => {
                        const next = new Set(prev);
                        if (next.has(job.id)) next.delete(job.id);
                        else next.add(job.id);
                        return next;
                      })
                    }
                    className="flex w-full items-start gap-2 text-left"
                  >
                    {job.status === 'completed' ? (
                      <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                    ) : job.status === 'failed' ? (
                      <X className="mt-0.5 h-4 w-4 text-red-600" />
                    ) : (
                      <Clock className="mt-0.5 h-4 w-4 text-brand-blue" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-brand-navy">{job.job_type}</h3>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusClass(job.status)}`}
                        >
                          {job.status === 'completed'
                            ? 'Complété'
                            : job.status === 'failed'
                              ? 'Erreur'
                              : job.status === 'queued'
                                ? 'En attente'
                                : job.status === 'running'
                                  ? 'En cours'
                                  : `${job.status}`}
                        </span>
                      </div>
                      {job.input ? (
                        <p className="mt-1 text-xs text-brand-navy/65">
                          {job.job_type === 'enrich_batch' && job.input.ids
                            ? `${job.input.ids.length} prospect(s): ${job.input.ids.slice(0, 2).join(', ')}${job.input.ids.length > 2 ? '...' : ''}`
                            : job.job_type === 'discover' && job.input.segment
                              ? `Segment: ${job.input.segment}${job.input.ville ? `, Ville: ${job.input.ville}` : ''}`
                              : job.job_type === 'generate' && job.input.prospect_id
                                ? `Prospect: ${job.input.prospect_id}`
                                : job.input.job_type || job.job_type}
                        </p>
                      ) : null}
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-brand-navy/55" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-brand-navy/55" />
                    )}
                  </button>

                  {isOpen ? (
                    <div className="mt-2 space-y-1 rounded-lg border border-brand-gray/70 bg-brand-gray/10 p-2 text-xs text-brand-navy">
                      <p>ID: {job.id}</p>
                      <p>Créé: {formatDate(job.created_at)}</p>
                      {job.started_at && <p>Démarré: {formatDate(job.started_at)}</p>}
                      {job.completed_at && <p>Complété: {formatDate(job.completed_at)}</p>}
                      {job.input && (
                        <p>Détails: {JSON.stringify(job.input).substring(0, 100)}...</p>
                      )}
                      {job.error ? <p className="text-red-700">Erreur: {job.error}</p> : null}
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </div>

      {(discoverResult?.sample?.length ?? 0) > 0 ? (
        <div className="rounded-card border border-brand-gray bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={() =>
              setBulkExpanded((prev) => {
                const next = new Set(prev);
                if (next.has('discover-sample')) next.delete('discover-sample');
                else next.add('discover-sample');
                return next;
              })
            }
            className="flex w-full items-center gap-2 text-left"
          >
            <Plus className="h-4 w-4 text-brand-blue" />
            <span className="text-sm font-semibold text-brand-navy">
              Exemple discover ({discoverResult?.sample?.length ?? 0})
            </span>
            <span className="ml-auto">
              {bulkExpanded.has('discover-sample') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          </button>

          {bulkExpanded.has('discover-sample') ? (
            <pre className="mt-2 overflow-auto rounded-lg border border-brand-gray/70 bg-slate-950 p-3 text-xs text-slate-100">
              {JSON.stringify(discoverResult?.sample ?? [], null, 2)}
            </pre>
          ) : null}
        </div>
      ) : null}

      {addingProspect ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg border border-brand-gray bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-brand-navy">Ajouter un prospect</h2>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              <div>
                <label className="block text-xs font-medium text-brand-navy mb-1">Segment *</label>
                <div className="flex flex-wrap gap-2">
                  {['Assurance', 'Garage', 'Concessionnaire', 'Flotte', 'B2C'].map((seg) => (
                    <button
                      key={seg}
                      type="button"
                      onClick={() => setNewProspectForm((prev) => ({ ...prev, segment: seg }))}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                        newProspectForm.segment === seg
                          ? 'bg-brand-blue text-white'
                          : 'border border-brand-gray bg-white text-brand-navy hover:bg-brand-gray/10'
                      }`}
                    >
                      {seg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="add-company"
                  className="block text-xs font-medium text-brand-navy mb-1"
                >
                  Entreprise *
                </label>
                <input
                  id="add-company"
                  type="text"
                  value={newProspectForm.company ?? ''}
                  onChange={(event) =>
                    setNewProspectForm((prev) => ({ ...prev, company: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm bg-slate-700 text-white placeholder-slate-400"
                  placeholder="Entreprise"
                />
              </div>

              <div>
                <label
                  htmlFor="add-name"
                  className="block text-xs font-medium text-brand-navy mb-1"
                >
                  Nom du contact
                </label>
                <input
                  id="add-name"
                  type="text"
                  value={newProspectForm.contact_name ?? ''}
                  onChange={(event) =>
                    setNewProspectForm((prev) => ({ ...prev, contact_name: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm bg-slate-700 text-white placeholder-slate-400"
                  placeholder="Nom du contact"
                />
              </div>

              <div>
                <label
                  htmlFor="add-title"
                  className="block text-xs font-medium text-brand-navy mb-1"
                >
                  Rôle / Poste
                </label>
                <input
                  id="add-title"
                  type="text"
                  value={newProspectForm.contact_title ?? ''}
                  onChange={(event) =>
                    setNewProspectForm((prev) => ({ ...prev, contact_title: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm bg-slate-700 text-white placeholder-slate-400"
                  placeholder="Rôle / Poste"
                />
              </div>

              <div>
                <label
                  htmlFor="add-email"
                  className="block text-xs font-medium text-brand-navy mb-1"
                >
                  Email
                </label>
                <input
                  id="add-email"
                  type="email"
                  value={newProspectForm.contact_email ?? ''}
                  onChange={(event) =>
                    setNewProspectForm((prev) => ({ ...prev, contact_email: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm bg-slate-700 text-white placeholder-slate-400"
                  placeholder="Email"
                />
              </div>

              <div>
                <label
                  htmlFor="add-country"
                  className="block text-xs font-medium text-brand-navy mb-1"
                >
                  Pays
                </label>
                <input
                  id="add-country"
                  type="text"
                  value={newProspectForm.country ?? ''}
                  onChange={(event) =>
                    setNewProspectForm((prev) => ({ ...prev, country: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm bg-slate-700 text-white placeholder-slate-400"
                  placeholder="Pays"
                />
              </div>

              <div>
                <label
                  htmlFor="add-owner"
                  className="block text-xs font-medium text-brand-navy mb-1"
                >
                  Owner
                </label>
                <input
                  id="add-owner"
                  type="text"
                  value={newProspectForm.owner ?? ''}
                  onChange={(event) =>
                    setNewProspectForm((prev) => ({ ...prev, owner: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm bg-slate-700 text-white placeholder-slate-400"
                  placeholder="Owner"
                />
              </div>

              <div>
                <label
                  htmlFor="add-whatsapp"
                  className="block text-xs font-medium text-brand-navy mb-1"
                >
                  WhatsApp (E.164)
                </label>
                <input
                  id="add-whatsapp"
                  type="text"
                  value={(newProspectForm as any).whatsapp ?? ''}
                  onChange={(event) =>
                    setNewProspectForm((prev) => ({
                      ...(prev as any),
                      whatsapp: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm bg-slate-700 text-white placeholder-slate-400"
                  placeholder="WhatsApp (E.164)"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddingProspect(false)}
                disabled={addProspectLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-gray px-4 py-2 text-sm font-medium text-brand-navy hover:bg-brand-gray/10 disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={addProspect}
                disabled={addProspectLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue/90 disabled:opacity-60"
              >
                {addProspectLoading ? 'Ajout en cours...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editingProspect ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg border border-brand-gray bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-brand-navy">Modifier prospect</h2>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              <div>
                <label className="block text-xs font-medium text-brand-navy mb-1">Segment</label>
                <div className="flex flex-wrap gap-2">
                  {['Assurance', 'Garage', 'Concessionnaire', 'Flotte', 'B2C'].map((seg) => (
                    <button
                      key={seg}
                      type="button"
                      onClick={() => setEditForm((prev) => ({ ...prev, segment: seg }))}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                        editForm.segment === seg
                          ? 'bg-brand-blue text-white'
                          : 'border border-brand-gray bg-white text-brand-navy hover:bg-brand-gray/10'
                      }`}
                    >
                      {seg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-company"
                  className="block text-xs font-medium text-brand-navy mb-1"
                >
                  Entreprise
                </label>
                <input
                  id="edit-company"
                  type="text"
                  value={editForm.company ?? ''}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, company: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm bg-slate-700 text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-name"
                  className="block text-xs font-medium text-brand-navy mb-1"
                >
                  Nom du contact
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editForm.contact_name ?? ''}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, contact_name: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm bg-slate-700 text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-title"
                  className="block text-xs font-medium text-brand-navy mb-1"
                >
                  Rôle / Poste
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editForm.contact_title ?? ''}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, contact_title: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm bg-slate-700 text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-email"
                  className="block text-xs font-medium text-brand-navy mb-1"
                >
                  Email
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={editForm.contact_email ?? ''}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, contact_email: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm bg-slate-700 text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-country"
                  className="block text-xs font-medium text-brand-navy mb-1"
                >
                  Pays
                </label>
                <input
                  id="edit-country"
                  type="text"
                  value={editForm.country ?? ''}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, country: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm bg-slate-700 text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-owner"
                  className="block text-xs font-medium text-brand-navy mb-1"
                >
                  Owner
                </label>
                <input
                  id="edit-owner"
                  type="text"
                  value={editForm.owner ?? ''}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, owner: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm bg-slate-700 text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-whatsapp"
                  className="block text-xs font-medium text-brand-navy mb-1"
                >
                  WhatsApp (E.164)
                </label>
                <input
                  id="edit-whatsapp"
                  type="text"
                  value={(editForm as any).whatsapp ?? ''}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...(prev as any), whatsapp: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm bg-slate-700 text-white placeholder-slate-400"
                  placeholder="WhatsApp (E.164)"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingProspect(null)}
                disabled={editLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-gray px-4 py-2 text-sm font-medium text-brand-navy hover:bg-brand-gray/10 disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={saveEditProspect}
                disabled={editLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue/90 disabled:opacity-60"
              >
                {editLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
