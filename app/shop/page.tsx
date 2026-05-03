import { createClient } from '@/lib/supabase/server';
import { ShopGrid } from '@/components/shop/ShopGrid';

export const revalidate = 60;

export default async function ShopPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <div className="container-x py-16 lg:py-24">
      <div className="max-w-2xl mb-14">
        <div className="eyebrow mb-4">The collection</div>
        <h1 className="font-serif text-5xl lg:text-7xl text-bone-100 leading-none mb-6">
          All our <em className="italic text-ember">coffees</em>
        </h1>
        <p className="text-bone-200/70 text-lg leading-relaxed">
          Single-origin beans from {(products ?? []).length} farms across three continents.
          Filter by roast level, origin, or flavor profile.
        </p>
      </div>

      <ShopGrid products={products ?? []} />
    </div>
  );
}
