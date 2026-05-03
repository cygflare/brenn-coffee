import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/lib/types';

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="container-x py-24 lg:py-32 border-t border-bone-200/8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-14">
        <div>
          <div className="eyebrow mb-4">The collection</div>
          <h2 className="font-serif text-4xl lg:text-6xl text-bone-100 leading-none">
            Featured <em className="italic text-ember">roasts</em>
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-xs tracking-[0.15em] uppercase text-ember border-b border-ember pb-1 self-start md:self-end hover:text-ember-400"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <div className="col-span-full text-center py-12 text-bone-200/40">
            <p className="font-serif text-2xl mb-2">No products yet</p>
            <p className="text-sm">Run the database seed to add starter products.</p>
          </div>
        )}
      </div>
    </section>
  );
}
