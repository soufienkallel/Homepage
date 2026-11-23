import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';
import Slot from './home/certification/Slot';
import { categoryLabel, formatReviewedDate, readingMinutes } from '../data/guides';

export default function GuideCard({ guide, isAdmin = false, onEdit, onDelete }) {
  const category = categoryLabel(guide.category);
  const reviewed = formatReviewedDate(guide.reviewed_at);
  const isDraft = guide.status !== 'published';
  const [failedUrl, setFailedUrl] = useState('');
  const showImage = Boolean(guide.imageUrl) && failedUrl !== guide.imageUrl;

  return (
    <article className="group relative border border-rule bg-white transition-colors duration-300 hover:border-rule-2 flex flex-col h-full">
      <div className="relative h-56 overflow-hidden flex-shrink-0">
        {showImage ? (
          <img
            src={guide.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setFailedUrl(guide.imageUrl)}
          />
        ) : (
          // Rendered only when needed: `.slot` sets its own display, which beats `hidden`.
          <Slot className="h-full w-full">Photo à venir</Slot>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-3 mb-4">
          {[category, `${readingMinutes(guide.body)} min`].filter(Boolean).join(' · ')}
          {isAdmin && isDraft && <span className="ml-2 text-accent-ink">· Brouillon</span>}
        </p>

        <h3 className="text-xl font-semibold text-ink mb-3 transition-colors group-hover:text-accent-ink">
          {guide.title}
        </h3>

        <p className="text-ink-2 leading-relaxed mb-4 flex-grow">{guide.description}</p>

        {reviewed && <p className="text-xs text-ink-3 mb-5">Relu le {reviewed}</p>}

        <div className="flex gap-3 mt-auto">
          <Link
            to={guide.url}
            className="flex-1 inline-flex items-center justify-center border border-rule-2 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
          >
            Lire le guide
          </Link>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(guide)}
                className="inline-flex items-center justify-center p-2.5 border border-rule-2 text-ink transition-colors hover:border-accent-ink hover:text-accent-ink"
                title="Modifier le guide"
                aria-label="Modifier le guide"
              >
                <Edit2 className="w-4.5 h-4.5 pointer-events-none" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(guide.id)}
                className="inline-flex items-center justify-center p-2.5 border border-rule-2 text-ink transition-colors hover:border-red-600 hover:text-red-600"
                title="Supprimer le guide"
                aria-label="Supprimer le guide"
              >
                <Trash2 className="w-4.5 h-4.5 pointer-events-none" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
