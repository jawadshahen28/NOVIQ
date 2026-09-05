import SectionHeader from '../../../components/SectionHeader';
import { categories } from '../../../data/categories';
import CategoryCard from './CategoryCard';

export default function CategoryShowcase() {
  return (
    <section className="bg-noviq-black py-16 lg:py-20">
      <div className="luxury-container">
        <SectionHeader
          eyebrow="المجموعات"
          title="اختيارات مصممة حول الشخصية والمناسبة"
          description="كل مجموعة تحمل نبرة مختلفة: اقتناء فاخر، حضور يومي، أو ساعة أعمال دقيقة بتفاصيل ذهبية هادئة."
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
