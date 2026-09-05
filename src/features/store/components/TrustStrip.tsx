import { CreditCard, Headphones, ShieldCheck, Truck } from 'lucide-react';

const trustItems = [
  { label: 'توصيل سريع', description: 'تحضير منظم للطلبات', icon: Truck },
  { label: 'جودة مضمونة', description: 'فحص قبل التسليم', icon: ShieldCheck },
  { label: 'دفع آمن', description: 'خيارات دفع موثوقة', icon: CreditCard },
  { label: 'دعم العملاء', description: 'مساعدة قبل وبعد الشراء', icon: Headphones },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-noviq-border bg-noviq-secondary py-5">
      <div className="luxury-container grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex min-h-12 items-center justify-center gap-3 text-center sm:text-right"
            >
              <Icon size={18} className="shrink-0 text-noviq-gold" strokeWidth={1.8} />
              <span>
                <span className="block text-sm font-semibold text-noviq-text">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-xs text-noviq-muted">
                  {item.description}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
