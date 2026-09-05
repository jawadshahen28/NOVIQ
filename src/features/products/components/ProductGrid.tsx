import type { Product } from '../../../types/catalog';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  emptyTitle?: string;
  columns?: '3' | '4';
}

export default function ProductGrid({
  products,
  columns = '3',
  emptyTitle = 'لا توجد ساعات مطابقة',
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-md border border-noviq-border bg-noviq-card px-6 py-14 text-center">
        <h3 className="font-heading text-xl font-bold text-noviq-text">{emptyTitle}</h3>
        <p className="mt-3 text-sm text-noviq-secondaryText">
          جرّب تغيير البحث أو ترتيب النتائج.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-4 sm:grid-cols-2 ${
        columns === '4' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
      }`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
