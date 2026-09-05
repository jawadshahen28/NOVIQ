import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="min-h-[560px] bg-noviq-black py-16">
      <div className="luxury-container">
        <div className="mx-auto max-w-xl rounded-md border border-noviq-border bg-noviq-card px-6 py-14 text-center">
          <p className="text-xs font-semibold text-noviq-gold">404</p>
          <h1 className="mt-3 font-heading text-3xl font-bold text-noviq-text">
            الصفحة غير موجودة
          </h1>
          <p className="mt-4 text-sm leading-7 text-noviq-secondaryText">
            الرابط الذي تحاول الوصول إليه غير متاح داخل متجر NOVIQ.
          </p>
          <Link
            to="/"
            className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-noviq-gold bg-noviq-gold px-6 text-sm font-bold text-noviq-black transition hover:border-noviq-goldHover hover:bg-noviq-goldHover"
          >
            العودة للرئيسية
            <ArrowLeft size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
