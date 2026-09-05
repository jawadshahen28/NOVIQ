interface AdminPlaceholderPageProps {
  title: string;
  description: string;
}

export default function AdminPlaceholderPage({ title, description }: AdminPlaceholderPageProps) {
  return (
    <section className="rounded-md border border-noviq-border bg-noviq-card p-5 sm:p-6" data-admin-placeholder>
      <p className="text-xs font-semibold text-noviq-gold">قريباً</p>
      <h2 className="mt-2 font-heading text-2xl font-bold text-noviq-text">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-noviq-secondaryText">
        {description}
      </p>
      <div className="mt-6 rounded-md border border-noviq-border bg-noviq-secondary p-4 text-sm leading-7 text-noviq-muted">
        سيتم تجهيز هذه الصفحة في مرحلة لاحقة دون التأثير على تجربة المتجر الحالية.
      </div>
    </section>
  );
}
