/**
 * Bandeau de tête des pages secondaires (refonte du 16 oct. 2026) : même registre que
 * /tarifs — fond navy, sur-titre mono, titre, une phrase. `children` reçoit les actions.
 * `media` (facultatif) se place à droite à partir de lg et n'est pas affiché en dessous : le
 * bandeau reste court sur téléphone.
 */
export default function PageHero({ eyebrow, title, lead, children, media }) {
  return (
    <section className="bg-navy text-white">
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 ${
          media
            ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-12 lg:items-center'
            : ''
        }`}
      >
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#f0a184] mb-4">
            {eyebrow}
          </p>
          <h1 className="text-4xl lg:text-5xl font-semibold leading-tight mb-4 max-w-3xl">
            {title}
          </h1>
          {lead && <p className="text-lg text-white/85 max-w-2xl leading-relaxed">{lead}</p>}
          {children && <div className="mt-8 flex flex-wrap items-center gap-4">{children}</div>}
        </div>
        {media && <div className="hidden lg:block">{media}</div>}
      </div>
    </section>
  );
}
