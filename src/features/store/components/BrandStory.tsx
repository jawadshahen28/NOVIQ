import { BadgeCheck, Gem, PackageCheck } from 'lucide-react';

const values = [
  {
    title: 'اختيار صارم',
    text: 'كل ساعة تدخل المجموعة بعد مراجعة الحضور، جودة التشطيب، وملاءمتها للإطلالات الرسمية واليومية.',
    icon: Gem,
  },
  {
    title: 'ثقة قبل الشراء',
    text: 'تفاصيل الحركة، العلبة، الزجاج، والسوار متاحة بوضوح كي يكون قرار الشراء مطمئنا.',
    icon: BadgeCheck,
  },
  {
    title: 'تسليم بعناية',
    text: 'كل طلب يمر بفحص نهائي وتغليف مناسب للهدايا قبل التحضير للتسليم.',
    icon: PackageCheck,
  },
];

export default function BrandStory() {
  return (
    <section className="border-y border-noviq-border bg-noviq-black py-16">
      <div className="luxury-container grid gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold text-noviq-gold">NOVIQ EXPERIENCE</p>
          <h2 className="mt-4 font-heading text-3xl font-bold leading-tight text-noviq-text">
            ساعات تُختار لحضورك قبل أن تُختار للوقت
          </h2>
          <p className="mt-5 text-sm leading-8 text-noviq-secondaryText">
            في NOVIQ، نهتم بالقطع التي تبدو واثقة تحت كم البدلة، وفي اللقاءات
            المسائية، وفي اللحظات التي تحتاج إلى تفصيل واحد يرفع الإطلالة كلها.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <div
                key={value.title}
                className="rounded-md border border-noviq-border bg-noviq-card p-5"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md border border-noviq-gold text-noviq-gold">
                  <Icon size={19} />
                </div>
                <h3 className="font-heading text-base font-bold text-noviq-text">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-noviq-secondaryText">{value.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
