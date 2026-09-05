import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeader from '../../../components/SectionHeader';
import { useStoreCatalog } from '../catalog/StoreCatalogContext';
import ProductGrid from '../../products/components/ProductGrid';

export default function FeaturedProducts() {
  const { products } = useStoreCatalog();
  const featuredProducts = products.filter((product) => product.isAvailable).slice(0, 6);

  return (
    <section className="bg-noviq-secondary py-16 lg:py-20">
      <div className="luxury-container">
        <SectionHeader
          eyebrow="الأكثر حضورا"
          title="ساعات مختارة للواجهة"
          description="قطع تمنح المعصم حضورا محسوبا، مع مواصفات واضحة وأسعار منتقاة لمحبي الساعات الراقية."
          action={
            <Link
              to="/category/curren"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-noviq-border px-5 text-sm font-semibold text-noviq-text transition hover:border-noviq-gold hover:text-noviq-gold"
            >
              اكتشف المزيد
              <ArrowLeft size={16} />
            </Link>
          }
        />

        <ProductGrid products={featuredProducts} />
      </div>
    </section>
  );
}
