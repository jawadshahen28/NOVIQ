import { Link } from 'react-router-dom';

export default function AdminNotFoundPage() {
  return (
    <section className="rounded-md border border-noviq-border bg-noviq-card p-5 text-center sm:p-8" data-admin-not-found>
      <p className="text-xs font-semibold text-noviq-gold">لوحة الإدارة</p>
      <h2 className="mt-2 font-heading text-2xl font-bold text-noviq-text">
        الصفحة غير موجودة
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-noviq-secondaryText">
        الرابط الذي تحاول فتحه غير متوفر داخل لوحة الإدارة.
      </p>
      <Link
        to="/admin/dashboard"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md border border-noviq-gold bg-noviq-gold px-5 text-sm font-bold text-noviq-black transition hover:border-noviq-goldHover hover:bg-noviq-goldHover"
      >
        العودة إلى لوحة التحكم
      </Link>
    </section>
  );
}
