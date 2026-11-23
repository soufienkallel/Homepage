import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, BookOpen, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApi as api } from '../../lib/adminApi';

type KBEntry = {
  id: string;
  category: string;
  title: string;
  content: string;
  is_active: boolean;
  version: number;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  company: 'Entreprise',
  voice: 'Voix de marque',
  proof: 'Preuves et faits',
  value_prop_insurance: 'VP - Assurance',
  value_prop_garage: 'VP - Garage',
  value_prop_dealer: 'VP - Concessionnaire',
  value_prop_fleet: 'VP - Flotte',
  value_prop_b2c: 'VP - Particulier',
};

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS);

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString('fr-TN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ModalShell({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-card border border-brand-gray/60 bg-brand-navy shadow-xl">
        <div className="max-h-[90vh] overflow-auto">{children}</div>
      </div>
      <button type="button" onClick={onClose} className="sr-only" aria-label="Fermer" />
    </div>
  );
}

export default function HomepageAdminKnowledge() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [editingEntry, setEditingEntry] = useState<KBEntry | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ),
    [entries]
  );

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api('/api/agents/knowledge');
      setEntries(response.entries ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const openEdit = (entry: KBEntry) => {
    setEditingEntry(entry);
    setEditTitle(entry.title);
    setEditContent(entry.content);
  };

  const handleSave = async () => {
    if (!editingEntry) return;

    setSaving(true);
    try {
      await api('/api/agents/knowledge', {
        method: 'PATCH',
        body: JSON.stringify({ id: editingEntry.id, title: editTitle, content: editContent }),
      });
      setEditingEntry(null);
      await fetchEntries();
    } catch (err) {
      window.alert(`Erreur: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newCategory || !newTitle || !newContent) return;

    setSaving(true);
    try {
      await api('/api/agents/knowledge', {
        method: 'POST',
        body: JSON.stringify({ category: newCategory, title: newTitle, content: newContent }),
      });
      setShowCreate(false);
      setNewCategory('');
      setNewTitle('');
      setNewContent('');
      await fetchEntries();
    } catch (err) {
      window.alert(`Erreur: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette entrée ?')) return;

    try {
      await api(`/api/agents/knowledge?id=${id}`, { method: 'DELETE' });
      await fetchEntries();
    } catch (err) {
      window.alert(`Erreur: ${(err as Error).message}`);
    }
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-brand-gray bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-gray text-brand-navy transition hover:bg-brand-gray/25"
            aria-label="Retour"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-brand-navy">Base de connaissance</h1>
            <p className="text-sm text-brand-navy/70">
              Gestion des entrées utilisées par les agents IA.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchEntries}
            className="inline-flex items-center gap-2 rounded-full border border-brand-gray px-3 py-2 text-sm font-medium text-brand-navy transition hover:bg-brand-gray/20"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-card border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-card border border-brand-gray bg-white p-10 shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-blue/20 border-t-brand-blue" />
          <p className="mt-3 text-center text-sm text-brand-navy/70">Chargement des entrées...</p>
        </div>
      ) : sortedEntries.length === 0 ? (
        <div className="rounded-card border border-brand-gray bg-white p-10 text-center shadow-sm">
          <BookOpen className="mx-auto h-8 w-8 text-brand-navy/35" />
          <p className="mt-3 text-sm text-brand-navy/70">Aucune entrée disponible.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEntries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-card border border-brand-gray bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-brand-blue" />
                <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                  {CATEGORY_LABELS[entry.category] || entry.category}
                </span>
                <span className="text-xs text-brand-navy/55">v{entry.version}</span>
                <span className="ml-auto text-xs text-brand-navy/55">
                  {formatDate(entry.updated_at)}
                </span>
              </div>

              <h2 className="text-base font-semibold text-brand-navy">{entry.title}</h2>
              <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-brand-navy/75">
                {entry.content}
              </p>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(entry)}
                  className="rounded-lg border border-brand-gray px-3 py-1.5 text-xs font-medium text-brand-navy transition hover:bg-brand-gray/25"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(entry.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editingEntry ? (
        <ModalShell onClose={() => setEditingEntry(null)}>
          <div className="border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand-blue" />
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-blue">
                {CATEGORY_LABELS[editingEntry.category] || editingEntry.category}
              </p>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="ml-auto rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4 px-6 py-5">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/60">
                Titre
              </span>
              <input
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-brand-blue"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/60">
                Contenu (Markdown)
              </span>
              <textarea
                value={editContent}
                onChange={(event) => setEditContent(event.target.value)}
                rows={16}
                className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-brand-blue"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-white/10 px-6 py-4">
            <button
              type="button"
              onClick={() => setEditingEntry(null)}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </ModalShell>
      ) : null}

      {showCreate ? (
        <ModalShell onClose={() => setShowCreate(false)}>
          <div className="border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Nouvelle entrée</h2>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="ml-auto rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4 px-6 py-5">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/60">
                Catégorie
              </span>
              <select
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-brand-blue"
              >
                <option value="">Sélectionner</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/60">
                Titre
              </span>
              <input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Ex: MALLOULIAUTO - Voix de marque"
                className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-brand-blue"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/60">
                Contenu (Markdown)
              </span>
              <textarea
                value={newContent}
                onChange={(event) => setNewContent(event.target.value)}
                placeholder="# Titre"
                rows={14}
                className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-brand-blue"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-white/10 px-6 py-4">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={saving || !newCategory || !newTitle || !newContent}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {saving ? 'Création...' : 'Créer'}
            </button>
          </div>
        </ModalShell>
      ) : null}
    </section>
  );
}
