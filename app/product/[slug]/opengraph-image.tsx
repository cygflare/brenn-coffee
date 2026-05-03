import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createClient } from '@/lib/supabase/server';
import { roastLabel } from '@/lib/utils';

export const alt = 'Brenn Coffee product preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 3600;

async function loadBrandFonts() {
  try {
    const fontsDir = join(process.cwd(), 'app', 'fonts');
    const [regular, italic] = await Promise.all([
      readFile(join(fontsDir, 'CormorantGaramond-Medium.ttf')),
      readFile(join(fontsDir, 'CormorantGaramond-MediumItalic.ttf')),
    ]);
    return [
      { name: 'Cormorant', data: regular, style: 'normal' as const, weight: 500 as const },
      { name: 'Cormorant', data: italic, style: 'italic' as const, weight: 500 as const },
    ];
  } catch {
    return [];
  }
}

export default async function ProductOG({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, tagline, description, country, roast_level, cupping_score, hero_image_url')
    .eq('slug', params.slug)
    .single();

  const fonts = await loadBrandFonts();
  const hasBrandFont = fonts.length > 0;

  const productName = product?.name ?? 'Brenn Coffee';
  const tagline =
    product?.tagline ??
    product?.description?.slice(0, 110) ??
    'Single-origin specialty coffee.';
  const meta = product
    ? [
        product.country,
        product.roast_level ? `${roastLabel(product.roast_level)} roast` : null,
        product.cupping_score ? `SCA ${product.cupping_score}` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0908',
          display: 'flex',
          flexDirection: 'column',
          padding: 80,
          fontFamily: hasBrandFont ? 'Cormorant' : undefined,
          color: '#F5F1E8',
          position: 'relative',
        }}
      >
        {product?.hero_image_url ? (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              backgroundImage: `url(${product.hero_image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.28,
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              top: -200,
              right: -200,
              width: 700,
              height: 700,
              borderRadius: 350,
              display: 'flex',
              background:
                'radial-gradient(closest-side, rgba(232,85,28,0.22), rgba(232,85,28,0))',
            }}
          />
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 18,
              height: 18,
              borderRadius: 9,
              background: '#E8551C',
            }}
          />
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              letterSpacing: 8,
              color: 'rgba(245, 241, 232, 0.55)',
            }}
          >
            BRENN COFFEE
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex' }} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 200,
              fontWeight: 500,
              lineHeight: 0.9,
              letterSpacing: -2,
            }}
          >
            {productName}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 36,
              fontStyle: hasBrandFont ? 'italic' : 'normal',
              color: 'rgba(245, 241, 232, 0.72)',
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            {tagline}
          </div>
          {meta && (
            <div
              style={{
                display: 'flex',
                marginTop: 24,
                fontSize: 20,
                letterSpacing: 6,
                color: '#E8551C',
                textTransform: 'uppercase',
              }}
            >
              {meta}
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...size,
      ...(fonts.length > 0 ? { fonts } : {}),
    }
  );
}
