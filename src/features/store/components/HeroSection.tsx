import { ArrowLeft } from 'lucide-react';
import heroWatch from '../../../assets/noviq-reference-hero.png';

export default function HeroSection() {
  return (
    <section className="overflow-hidden border-b border-noviq-border bg-noviq-black">
      <div
        className="relative mx-auto h-[clamp(550px,calc(140vw+30px),650px)] max-w-[1440px] gap-0 lg:grid lg:h-auto lg:min-h-[600px] lg:grid-cols-[52%_48%] lg:[direction:ltr]"
      >
        <div className="hero-image-reveal absolute inset-0 z-0 overflow-hidden bg-noviq-pure lg:relative lg:inset-auto lg:order-1 lg:min-h-[600px]">
          <img
            src={heroWatch}
            alt="ساعة NOVIQ فاخرة باللون الأسود والذهبي"
            className="h-full w-full object-cover object-[41%_center] lg:object-[39%_center]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noviq-black via-noviq-black/70 to-transparent lg:hidden" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-noviq-black to-transparent lg:left-auto lg:right-0 lg:w-24 lg:bg-gradient-to-l" />
        </div>

        <div
          className="hero-text-reveal absolute inset-0 z-10 flex min-w-0 items-end justify-center px-4 pb-2 pt-16 text-center sm:px-6 lg:relative lg:inset-auto lg:order-2 lg:min-h-[600px] lg:items-center lg:justify-end lg:px-10 lg:py-0 lg:text-right"
          dir="rtl"
        >
          <div className="w-full max-w-full translate-y-5 lg:max-w-[520px] lg:translate-y-0">
            <h1
              className="font-heading text-[clamp(36px,10.6vw,42px)] font-semibold leading-[1.18] text-noviq-text sm:text-[52px] lg:text-[64px] lg:leading-[1.15]"
              data-home-hero-title
            >
              <span className="block whitespace-nowrap">ساعة تليق</span>
              <span className="block text-noviq-gold">بحضورك.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-[520px] text-[15px] leading-[1.85] text-noviq-secondaryText min-[390px]:text-base sm:text-[17px] lg:mx-0 lg:mt-6">
              اكتشف مجموعة مختارة من الساعات التي تجمع بين الأناقة، الجودة
              والتفاصيل التي تصنع الفرق.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:mt-8 lg:justify-start">
              <a
                href="/#selected-watches"
                className="inline-flex h-11 w-fit min-w-[126px] items-center justify-center gap-2 rounded border border-noviq-gold bg-noviq-gold px-5 text-sm font-medium text-noviq-black transition duration-200 hover:-translate-y-0.5 hover:border-noviq-goldHover hover:bg-noviq-goldHover sm:h-12 sm:min-w-[142px] sm:px-7"
                data-home-hero-button
              >
                تسوّق الآن
                <ArrowLeft size={18} />
              </a>
              <a
                href="/#categories"
                className="inline-flex h-11 w-fit min-w-[136px] items-center justify-center rounded border border-noviq-border bg-transparent px-5 text-sm font-medium text-noviq-text transition duration-200 hover:-translate-y-0.5 hover:border-noviq-gold hover:text-noviq-gold sm:h-12 sm:min-w-[150px] sm:px-7"
                data-home-hero-button
              >
                استكشف الفئات
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
