import { useEffect, useRef } from 'react';
import { questions } from '../../../data/homeFaqData';

/**
 * FAQ de l'accueil : les cinq questions marquées `home` sont visibles, les autres derrière
 * « Voir toutes les questions » (docs/specs/2026-10-refonte-accueil.md, bloc 7). Toutes
 * restent dans la page, donc dans le JSON-LD FAQPage de Home.jsx.
 */
const homeQuestions = questions.filter((item) => item.home);
const moreQuestions = questions.filter((item) => !item.home);

function Question({ item }) {
  return (
    <details data-faq className="group border-b border-rule">
      <summary className="py-4 font-semibold text-[15.5px] text-ink cursor-pointer list-none flex justify-between items-baseline gap-5">
        {item.q}
        <span className="font-mono text-accent-ink text-lg flex-shrink-0 group-open:hidden">+</span>
        <span className="font-mono text-accent-ink text-lg flex-shrink-0 hidden group-open:inline">
          –
        </span>
      </summary>
      <p className="pb-5 text-[14.5px] text-ink-2 leading-relaxed max-w-[72ch]">{item.a}</p>
    </details>
  );
}

export default function FAQ() {
  const listRef = useRef(null);

  // On wide screens, one question open at a time. Only the questions take part: the
  // « Voir toutes les questions » wrapper stays open while one of its questions opens.
  useEffect(() => {
    const container = listRef.current;
    if (!container) return undefined;

    const items = Array.from(container.querySelectorAll('details[data-faq]'));
    const handleToggle = (event) => {
      const target = event.target;
      if (target.open && window.matchMedia('(min-width: 760px)').matches) {
        items.forEach((item) => {
          if (item !== target) item.open = false;
        });
      }
    };

    items.forEach((item) => item.addEventListener('toggle', handleToggle));
    return () => items.forEach((item) => item.removeEventListener('toggle', handleToggle));
  }, []);

  return (
    <section id="faq" className="py-20 bg-ground-2 border-t border-rule scroll-mt-[90px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="font-mono text-accent-ink text-[11px] font-medium uppercase tracking-[0.14em] mb-3.5">
            Questions fréquentes
          </p>
          <h2 className="text-3xl lg:text-4xl font-semibold leading-tight text-ink">
            Ce qu&apos;il faut savoir avant de réserver.
          </h2>
        </div>

        <div ref={listRef} className="border-t border-rule max-w-4xl">
          {homeQuestions.map((item) => (
            <Question key={item.q} item={item} />
          ))}
          {moreQuestions.length > 0 && (
            <details className="group/more">
              <summary className="py-4 text-sm font-semibold text-accent-ink cursor-pointer list-none">
                <span className="group-open/more:hidden">
                  Voir toutes les questions ({questions.length})
                </span>
                <span className="hidden group-open/more:inline">Moins de questions</span>
              </summary>
              <div className="border-t border-rule">
                {moreQuestions.map((item) => (
                  <Question key={item.q} item={item} />
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </section>
  );
}
