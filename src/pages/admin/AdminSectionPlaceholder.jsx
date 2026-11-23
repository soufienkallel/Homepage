export default function AdminSectionPlaceholder({ title, description, sourceRoute }) {
  return (
    <section className="rounded-card border border-brand-gray bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-brand-navy">{title}</h1>
      <p className="mt-3 text-brand-navy/80">{description}</p>
      {sourceRoute ? (
        <p className="mt-4 text-sm text-brand-navy/60">
          Migration depuis Unified Admin: <span className="font-medium">{sourceRoute}</span>
        </p>
      ) : null}
    </section>
  );
}
