import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Category } from '../../../types/catalog';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="group relative min-h-[300px] overflow-hidden rounded-md border border-noviq-border bg-noviq-card"
    >
      <img
        src={category.image}
        alt={category.name}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-noviq-black opacity-70 transition group-hover:opacity-60" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <div className="mb-4 h-px w-24 bg-noviq-gold" />
        <h3 className="font-heading text-2xl font-bold text-noviq-text">{category.name}</h3>
        <p className="mt-3 min-h-14 text-sm leading-7 text-noviq-secondaryText">
          {category.featuredCopy}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-noviq-gold">
          استعرض المجموعة
          <ArrowLeft size={16} />
        </span>
      </div>
    </Link>
  );
}
