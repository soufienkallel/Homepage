import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Database,
  Edit,
  Globe,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApi as api } from '../../lib/adminApi';

type ConfigType = 'segments' | 'sources';

type ConfigItem = {
  id: string;
  key: string;
  label: string;
  description?: string;
  enabled?: boolean;
  config: any;
  created_at?: string;
  updated_at?: string;
};

type SegmentForm = {
  slug: string;
  label_fr: string;
  description_fr: string;
  search_hints: string;
  sort_order: string;
  enabled: boolean;
};

type SourceForm = {
  name: string;
  url: string;
  description_fr: string;
  source_type: 'discovery' | 'enrichment' | 'both';
  priority: string;
  segments: string[];
  enabled: boolean;
};

function defaultSegmentForm(): SegmentForm {
  return {
    slug: '',
    label_fr: '',
    description_fr: '',
    search_hints: '',
    sort_order: '1',
    enabled: true,
  };
}

function defaultSourceForm(): SourceForm {
  return {
    name: '',
    url: '',
    description_fr: '',
    source_type: 'discovery',
    priority: '5',
    segments: [],
    enabled: true,
  };
}

function parseList(value: string) {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function formatDate(value?: string) {
  if (!value) return '-';
  return new Date(value).toLocaleString('fr-TN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HomepageAdminDiscoveryConfig() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ConfigType>('segments');

  const [segments, setSegments] = useState<ConfigItem[]>([]);
  const [sources, setSources] = useState<ConfigItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [segmentForm, setSegmentForm] = useState<SegmentForm>(defaultSegmentForm());
  const [sourceForm, setSourceForm] = useState<SourceForm>(defaultSourceForm());

  const [editingSegment, setEditingSegment] = useState<string | null>(null);
  const [editingSource, setEditingSource] = useState<string | null>(null);

  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(new Set());
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [segmentsRes, sourcesRes] = await Promise.all([
        api('/api/agents/sales/discovery-config?entity=segments&limit=500'),
        api('/api/agents/sales/discovery-config?entity=sources&limit=500'),
      ]);

      // Map segments
      const mappedSegments = (segmentsRes.segments ?? []).map((item: any) => ({
        id: item.slug,
        key: item.slug,
        label: item.label_fr,
        description: item.description_fr,
        enabled: item.enabled,
        config: {
          search_hints: item.search_hints,
          sort_order: item.sort_order,
        },
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      // Map sources
      const mappedSources = (sourcesRes.sources ?? []).map((item: any) => ({
        id: item.id,
        key: item.name,
        label: item.name,
        description: item.description_fr,
        enabled: item.enabled,
        config: {
          url: item.url,
          source_type: item.source_type,
          priority: item.priority,
          segments: item.segments,
        },
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setSegments(mappedSegments);
      setSources(mappedSources);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveSegment = async () => {
    const payload = {
      slug: segmentForm.slug.trim(),
      label_fr: segmentForm.label_fr.trim(),
      description_fr: segmentForm.description_fr.trim() || null,
      search_hints: segmentForm.search_hints.trim() || null,
      sort_order: Number(segmentForm.sort_order || '1'),
      enabled: segmentForm.enabled,
    };

    if (!payload.slug || !payload.label_fr) {
      window.alert('Slug et label_fr sont obligatoires.');
      return;
    }

    try {
      if (editingSegment) {
        await api(`/api/agents/sales/discovery-config/${editingSegment}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await api('/api/agents/sales/discovery-config?entity=segments', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setSegmentForm(defaultSegmentForm());
      setEditingSegment(null);
      await loadData();
    } catch (err) {
      window.alert(`Erreur segment: ${(err as Error).message}`);
    }
  };

  const handleSaveSource = async () => {
    const payload = {
      name: sourceForm.name.trim(),
      url: sourceForm.url.trim() || null,
      description_fr: sourceForm.description_fr.trim() || null,
      source_type: sourceForm.source_type,
      priority: Number(sourceForm.priority || '5'),
      segments: sourceForm.segments,
      enabled: sourceForm.enabled,
    };

    if (!payload.name) {
      window.alert('Nom est obligatoire.');
      return;
    }

    try {
      if (editingSource) {
        await api(`/api/agents/sales/discovery-config/${editingSource}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await api('/api/agents/sales/discovery-config?entity=sources', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setSourceForm(defaultSourceForm());
      setEditingSource(null);
      await loadData();
    } catch (err) {
      window.alert(`Erreur source: ${(err as Error).message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cet element ?')) return;

    try {
      await api(`/api/agents/sales/discovery-config/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (err) {
      window.alert(`Erreur suppression: ${(err as Error).message}`);
    }
  };

  const startEditSegment = (item: ConfigItem) => {
    setActiveTab('segments');
    setEditingSegment(item.id);
    setSegmentForm({
      slug: item.key,
      label_fr: item.label,
      description_fr: item.description ?? '',
      search_hints: item.config?.search_hints ?? '',
      sort_order: String(item.config?.sort_order ?? 1),
      enabled: item.enabled ?? true,
    });
  };

  const startEditSource = (item: ConfigItem) => {
    setActiveTab('sources');
    setEditingSource(item.id);
    setSourceForm({
      name: item.label,
      url: item.config?.url ?? '',
      description_fr: item.description ?? '',
      source_type: item.config?.source_type ?? 'discovery',
      priority: String(item.config?.priority ?? 5),
      segments: item.config?.segments ?? [],
      enabled: item.enabled ?? true,
    });
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
          <Database className="h-5 w-5 text-brand-blue" />
          <h1 className="text-xl font-bold text-brand-navy">Discovery config</h1>
          <button
            type="button"
            onClick={loadData}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-brand-gray px-3 py-2 text-sm font-medium text-brand-navy transition hover:bg-brand-gray/20"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('segments')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeTab === 'segments'
              ? 'bg-brand-blue text-white'
              : 'border border-brand-gray bg-white text-brand-navy hover:bg-brand-gray/20'
          }`}
        >
          Segments ({segments.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sources')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeTab === 'sources'
              ? 'bg-brand-blue text-white'
              : 'border border-brand-gray bg-white text-brand-navy hover:bg-brand-gray/20'
          }`}
        >
          Sources ({sources.length})
        </button>
      </div>

      {error ? (
        <div className="rounded-card border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <div className="rounded-card border border-brand-gray bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-brand-navy">
              {activeTab === 'segments'
                ? editingSegment
                  ? 'Modifier segment'
                  : 'Nouveau segment'
                : editingSource
                  ? 'Modifier source'
                  : 'Nouvelle source'}
            </h2>

            {activeTab === 'segments' ? (
              <div className="space-y-3">
                <input
                  value={segmentForm.slug}
                  onChange={(event) =>
                    setSegmentForm((prev) => ({ ...prev, slug: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm"
                  placeholder="Slug (identifiant unique)"
                />
                <input
                  value={segmentForm.label_fr}
                  onChange={(event) =>
                    setSegmentForm((prev) => ({ ...prev, label_fr: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm"
                  placeholder="Label (nom affiché)"
                />
                <textarea
                  value={segmentForm.description_fr}
                  onChange={(event) =>
                    setSegmentForm((prev) => ({ ...prev, description_fr: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Description (utilisée dans le prompt Claude)"
                />
                <textarea
                  value={segmentForm.search_hints}
                  onChange={(event) =>
                    setSegmentForm((prev) => ({ ...prev, search_hints: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Conseils de recherche (optionnel)"
                />
                <input
                  type="number"
                  min={1}
                  value={segmentForm.sort_order}
                  onChange={(event) =>
                    setSegmentForm((prev) => ({ ...prev, sort_order: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm"
                  placeholder="Ordre d'affichage"
                />
                <label className="inline-flex items-center gap-2 text-sm text-brand-navy">
                  <input
                    type="checkbox"
                    checked={segmentForm.enabled}
                    onChange={(event) =>
                      setSegmentForm((prev) => ({ ...prev, enabled: event.target.checked }))
                    }
                  />
                  Active
                </label>

                <div className="flex justify-end gap-2">
                  {editingSegment ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSegment(null);
                        setSegmentForm(defaultSegmentForm());
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-brand-gray px-3 py-2 text-xs font-medium text-brand-navy"
                    >
                      <X className="h-3.5 w-3.5" />
                      Annuler
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleSaveSegment}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-3 py-2 text-xs font-semibold text-white"
                  >
                    {editingSegment ? (
                      <Save className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    {editingSegment ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  value={sourceForm.name}
                  onChange={(event) =>
                    setSourceForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm"
                  placeholder="Nom"
                />
                <input
                  value={sourceForm.url}
                  onChange={(event) =>
                    setSourceForm((prev) => ({ ...prev, url: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm"
                  placeholder="URL (optionnel)"
                />
                <textarea
                  value={sourceForm.description_fr}
                  onChange={(event) =>
                    setSourceForm((prev) => ({ ...prev, description_fr: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Description (utilisée dans le prompt Claude)"
                />
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-navy">Type de source</label>
                  <div className="flex gap-2">
                    {(['discovery', 'enrichment', 'both'] as const).map((type) => (
                      <label
                        key={type}
                        className="inline-flex items-center gap-1 text-sm text-brand-navy"
                      >
                        <input
                          type="radio"
                          name="source_type"
                          value={type}
                          checked={sourceForm.source_type === type}
                          onChange={(event) =>
                            setSourceForm((prev) => ({
                              ...prev,
                              source_type: event.target.value as any,
                            }))
                          }
                        />
                        {type === 'discovery'
                          ? 'Découverte'
                          : type === 'enrichment'
                            ? 'Enrichissement'
                            : 'Les deux'}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-navy">
                    Segments (vide = tous)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['insurance', 'garage', 'dealer', 'fleet'].map((seg) => (
                      <label
                        key={seg}
                        className="inline-flex items-center gap-1 text-sm text-brand-navy"
                      >
                        <input
                          type="checkbox"
                          checked={sourceForm.segments.includes(seg)}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setSourceForm((prev) => ({
                                ...prev,
                                segments: [...prev.segments, seg],
                              }));
                            } else {
                              setSourceForm((prev) => ({
                                ...prev,
                                segments: prev.segments.filter((s) => s !== seg),
                              }));
                            }
                          }}
                        />
                        {seg === 'insurance'
                          ? 'Assurance'
                          : seg === 'garage'
                            ? 'Garage'
                            : seg === 'dealer'
                              ? 'Concessionnaire'
                              : 'Flotte'}
                      </label>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={sourceForm.priority}
                  onChange={(event) =>
                    setSourceForm((prev) => ({ ...prev, priority: event.target.value }))
                  }
                  className="w-full rounded-lg border border-brand-gray px-3 py-2 text-sm"
                  placeholder="Priorité (1-10, plus = plus important)"
                />
                <label className="inline-flex items-center gap-2 text-sm text-brand-navy">
                  <input
                    type="checkbox"
                    checked={sourceForm.enabled}
                    onChange={(event) =>
                      setSourceForm((prev) => ({ ...prev, enabled: event.target.checked }))
                    }
                  />
                  Active
                </label>

                <div className="flex justify-end gap-2">
                  {editingSource ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSource(null);
                        setSourceForm(defaultSourceForm());
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-brand-gray px-3 py-2 text-xs font-medium text-brand-navy"
                    >
                      <X className="h-3.5 w-3.5" />
                      Annuler
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleSaveSource}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-3 py-2 text-xs font-semibold text-white"
                  >
                    {editingSource ? (
                      <Save className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    {editingSource ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-3 space-y-3">
          {loading ? (
            <div className="rounded-card border border-brand-gray bg-white p-8 text-sm text-brand-navy/70">
              Chargement...
            </div>
          ) : activeTab === 'segments' ? (
            segments.length === 0 ? (
              <div className="rounded-card border border-brand-gray bg-white p-8 text-sm text-brand-navy/70">
                Aucun segment.
              </div>
            ) : (
              segments.map((segment) => {
                const isExpanded = expandedSegments.has(segment.id);
                return (
                  <article
                    key={segment.id}
                    className="rounded-card border border-brand-gray bg-white p-3 shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSegments((prev) => {
                          const next = new Set(prev);
                          if (next.has(segment.id)) next.delete(segment.id);
                          else next.add(segment.id);
                          return next;
                        })
                      }
                      className="flex w-full items-start gap-2 text-left"
                    >
                      <Database className="mt-0.5 h-4 w-4 text-brand-blue" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-brand-navy">{segment.label}</h3>
                          <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                            {segment.key}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${segment.enabled ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}
                          >
                            {segment.enabled ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-brand-navy/65">
                          {segment.description || '-'}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-brand-navy/55" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-brand-navy/55" />
                      )}
                    </button>

                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEditSegment(segment)}
                        className="inline-flex items-center gap-1 rounded-lg border border-brand-gray px-3 py-1.5 text-xs font-medium text-brand-navy"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(segment.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Supprimer
                      </button>
                    </div>

                    {isExpanded ? (
                      <div className="mt-2 rounded-lg border border-brand-gray/70 bg-brand-gray/10 p-3 text-xs text-brand-navy space-y-2">
                        <p>
                          <span className="font-semibold">Créé:</span>{' '}
                          {formatDate(segment.created_at)}
                        </p>
                        <p>
                          <span className="font-semibold">Mis à jour:</span>{' '}
                          {formatDate(segment.updated_at)}
                        </p>
                        {segment.config?.search_hints && (
                          <p>
                            <span className="font-semibold">Indices:</span>{' '}
                            {segment.config.search_hints}
                          </p>
                        )}
                        {segment.config?.sort_order !== undefined && (
                          <p>
                            <span className="font-semibold">Ordre:</span>{' '}
                            {segment.config.sort_order}
                          </p>
                        )}
                      </div>
                    ) : null}
                  </article>
                );
              })
            )
          ) : sources.length === 0 ? (
            <div className="rounded-card border border-brand-gray bg-white p-8 text-sm text-brand-navy/70">
              Aucune source.
            </div>
          ) : (
            sources.map((source) => {
              const isExpanded = expandedSources.has(source.id);
              return (
                <article
                  key={source.id}
                  className="rounded-card border border-brand-gray bg-white p-3 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSources((prev) => {
                        const next = new Set(prev);
                        if (next.has(source.id)) next.delete(source.id);
                        else next.add(source.id);
                        return next;
                      })
                    }
                    className="flex w-full items-start gap-2 text-left"
                  >
                    <Globe className="mt-0.5 h-4 w-4 text-brand-blue" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-brand-navy">{source.label}</h3>
                        <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                          {source.key}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${source.enabled ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}
                        >
                          {source.enabled ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-brand-navy/65">{source.description || '-'}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-brand-navy/55" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-brand-navy/55" />
                    )}
                  </button>

                  <div className="mt-2 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEditSource(source)}
                      className="inline-flex items-center gap-1 rounded-lg border border-brand-gray px-3 py-1.5 text-xs font-medium text-brand-navy"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Editer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(source.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Supprimer
                    </button>
                  </div>

                  {isExpanded ? (
                    <div className="mt-2 rounded-lg border border-brand-gray/70 bg-brand-gray/10 p-3 text-xs text-brand-navy space-y-2">
                      <p>
                        <span className="font-semibold">Créé:</span> {formatDate(source.created_at)}
                      </p>
                      <p>
                        <span className="font-semibold">Mis à jour:</span>{' '}
                        {formatDate(source.updated_at)}
                      </p>
                      {source.config?.url && (
                        <p>
                          <span className="font-semibold">URL:</span>{' '}
                          <a
                            href={source.config.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-blue underline"
                          >
                            {source.config.url}
                          </a>
                        </p>
                      )}
                      {source.config?.source_type && (
                        <p>
                          <span className="font-semibold">Type:</span> {source.config.source_type}
                        </p>
                      )}
                      {source.config?.priority !== undefined && (
                        <p>
                          <span className="font-semibold">Priorité:</span> {source.config.priority}
                        </p>
                      )}
                      {source.config?.segments && source.config.segments.length > 0 && (
                        <p>
                          <span className="font-semibold">Segments:</span>{' '}
                          {source.config.segments.join(', ')}
                        </p>
                      )}
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
