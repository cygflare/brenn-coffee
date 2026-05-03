import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ProductDetail } from '@/components/product/ProductDetail';
import type { ProductWithVariants } from '@/lib/types';
import { roastLabel } from '@/lib/utils';

export const revalidate = 60;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, tagline, description, origin')
    .eq('slug', params.slug)
    .single();

  if (!product) return { title: 'Not found' };

  const description =
    product.tagline ??
    product.description?.slice(0, 160) ??
    `${product.name} — single-origin coffee from ${product.origin}.`;

  const canonical = `/product/${params.slug}`;

  return {
    title: product.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      title: `${product.name} · Brenn Coffee`,
      description,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} · Brenn Coffee`,
      description,
    },
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

  const productWithVariants = product as ProductWithVariants;
  const productJsonLd = buildProductJsonLd(productWithVariants);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(productWithVariants);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetail product={productWithVariants} />
    </>
  );
}

function buildBreadcrumbJsonLd(product: ProductWithVariants) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: `${SITE_URL}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${SITE_URL}/product/${product.slug}`,
      },
    ],
  };
}

function buildProductJsonLd(product: ProductWithVariants) {
  const url = `${SITE_URL}/product/${product.slug}`;
  const inStock = product.inventory_kg > 0;
  const images = [
    ...(product.hero_image_url ? [product.hero_image_url] : []),
    ...(product.gallery_images ?? []),
  ];

  const offers = (product.variants ?? [])
    .filter((v) => v.is_active)
    .map((v) => ({
      '@type': 'Offer',
      sku: v.sku,
      price: (v.price_pence / 100).toFixed(2),
      priceCurrency: 'GBP',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url,
      itemCondition: 'https://schema.org/NewCondition',
    }));

  const additionalProperty: Array<{ '@type': 'PropertyValue'; name: string; value: string | number }> = [];
  if (product.process) additionalProperty.push({ '@type': 'PropertyValue', name: 'Process', value: product.process });
  if (product.altitude_m) additionalProperty.push({ '@type': 'PropertyValue', name: 'Altitude', value: `${product.altitude_m}m` });
  if (product.variety) additionalProperty.push({ '@type': 'PropertyValue', name: 'Variety', value: product.variety });
  if (product.cupping_score) additionalProperty.push({ '@type': 'PropertyValue', name: 'Cupping score', value: product.cupping_score });
  if (product.farm_name) additionalProperty.push({ '@type': 'PropertyValue', name: 'Farm', value: product.farm_name });
  if (product.roast_level) additionalProperty.push({ '@type': 'PropertyValue', name: 'Roast level', value: roastLabel(product.roast_level) });

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description:
      product.description ??
      product.tagline ??
      `${product.name} — single-origin specialty coffee from ${product.origin}.`,
    sku: product.slug,
    url,
    ...(images.length > 0 && { image: images }),
    brand: { '@type': 'Brand', name: 'Brenn Coffee' },
    manufacturer: { '@type': 'Organization', name: 'Brenn Coffee' },
    category: 'Specialty Coffee',
    ...(product.country && { countryOfOrigin: product.country }),
    ...(product.created_at && { releaseDate: product.created_at.split('T')[0] }),
    ...(product.flavor_notes?.length
      ? { keywords: product.flavor_notes.join(', ') }
      : {}),
    ...(additionalProperty.length > 0 && { additionalProperty }),
    offers:
      offers.length > 0
        ? {
            '@type': 'AggregateOffer',
            priceCurrency: 'GBP',
            lowPrice: Math.min(...offers.map((o) => parseFloat(o.price))).toFixed(2),
            highPrice: Math.max(...offers.map((o) => parseFloat(o.price))).toFixed(2),
            offerCount: offers.length,
            availability: inStock
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            offers,
          }
        : undefined,
  };
}
