import { createClient } from '@/lib/supabase/server';
import { Hero } from '@/components/home/Hero';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BrewingMethods } from '@/components/home/BrewingMethods';
import { StorySection } from '@/components/home/StorySection';
import { ValueBar } from '@/components/home/ValueBar';

export const revalidate = 60; // ISR: rebuild every 60s in production

export default async function HomePage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <>
      <Hero />
      <ValueBar />
      <FeaturedProducts products={products ?? []} />
      <BrewingMethods />
      <StorySection />
    </>
  );
}
