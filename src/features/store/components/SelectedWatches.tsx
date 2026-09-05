import { useStoreCatalog } from '../catalog/StoreCatalogContext';
import HomeProductCard from './HomeProductCard';

export default function SelectedWatches() {
  const { products } = useStoreCatalog();
  const selectedProducts = products.filter((product) => product.isAvailable);

  return (
    <section id="selected-watches" className="bg-noviq-black pt-2 pb-10 lg:pt-4 lg:pb-14">
      <div className="luxury-container">
        <div className="mb-5 text-center lg:mb-6">
          <h2 className="font-heading text-2xl font-semibold text-noviq-gold lg:text-[28px]">
            ساعات مختارة
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {selectedProducts.map((product, index) => (
            <HomeProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
