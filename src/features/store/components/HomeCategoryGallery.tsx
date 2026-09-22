import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import menDepartmentImage from '../../../assets/departments/men-accessories.jpg';
import womenDepartmentImage from '../../../assets/departments/women-accessories.jpg';
import { useStoreSettings } from '../settings/StoreSettingsContext';

const departmentDefinitions = [
  {
    image: menDepartmentImage,
    imagePosition: 'center 56%',
    label: 'رجال',
    to: '/men',
  },
  {
    image: womenDepartmentImage,
    imagePosition: 'center 54%',
    label: 'نساء',
    to: '/women',
  },
] as const;

export default function HomeCategoryGallery() {
  const { settings } = useStoreSettings();
  const departments = departmentDefinitions.map((department) => ({
    ...department,
    image:
      department.to === '/men'
        ? settings.menDepartmentImage || department.image
        : settings.womenDepartmentImage || department.image,
  }));

  return (
    <section id="categories" className="bg-noviq-black pt-7 pb-7 lg:pt-9 lg:pb-10">
      <div className="luxury-container">
        <div className="mb-5 text-center lg:mb-6">
          <h2 className="font-heading text-2xl font-semibold text-noviq-gold lg:text-[28px]">
            اختر القسم
          </h2>
        </div>

        <nav aria-label="أقسام المتجر" className="grid gap-3.5 sm:gap-4 lg:grid-cols-2">
          {departments.map((department, index) => (
            <Link
              key={department.to}
              to={department.to}
              aria-label={`تسوق قسم ${department.label}`}
              className="home-reveal group relative isolate h-[210px] overflow-hidden rounded border border-noviq-luxuryBorder bg-noviq-card outline-none transition duration-300 hover:-translate-y-0.5 hover:border-noviq-gold focus-visible:ring-2 focus-visible:ring-noviq-gold focus-visible:ring-offset-2 focus-visible:ring-offset-noviq-black min-[390px]:h-[224px] sm:h-[250px] lg:h-[280px]"
              style={{ animationDelay: `${index * 70}ms` }}
              data-home-department-card={department.to.slice(1)}
            >
              <img
                src={department.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                style={{ objectPosition: department.imagePosition }}
                decoding="async"
                height={800}
                loading="lazy"
                width={1200}
              />
              <div className="absolute inset-0 bg-noviq-black/45 transition duration-300 group-hover:bg-noviq-black/38" />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-noviq-pure/95 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-5 sm:px-6 sm:pb-6" dir="rtl">
                <h3 className="font-heading text-[26px] font-semibold text-noviq-text sm:text-[30px]">
                  {department.label}
                </h3>
                <span className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-noviq-gold">
                  اكتشف
                  <ArrowLeft aria-hidden="true" size={15} />
                </span>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
