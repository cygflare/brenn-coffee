import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductDetail } from '@/components/product/ProductDetail';
import type { ProductWithVariants } from '@/lib/types';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, tagline, description')
    .eq('slug', params.slug)
    .single();

  if (!product) return { title: 'Not found' };
  return {
    title: `${product.name} — Brenn Coffee`,
    description: product.tagline ?? product.description?.slice(0, 160),
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (!product) notFound();

  return <ProductDetail product={product as ProductWithVariants} />;
}
