import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'Brenn Coffee — Slow burn. Bright finish.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 86400;

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

export default async function OG() {
  const fonts = await loadBrandFonts();
  const hasBrandFont = fonts.length > 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0908',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: hasBrandFont ? 'Cormorant' : undefined,
          color: '#F5F1E8',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -160,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 600,
            borderRadius: 300,
            background: 'radial-gradient(closest-side, rgba(232,85,28,0.18), rgba(232,85,28,0))',
            display: 'flex',
          }}
        />
        <div
          style={{
            display: 'flex',
            width: 64,
            height: 64,
            borderRadius: 32,
            background: '#E8551C',
            marginBottom: 56,
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: 184,
            fontWeight: 500,
            letterSpacing: 24,
            lineHeight: 1,
            paddingLeft: 24,
          }}
        >
          BRENN
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 48,
            fontSize: 38,
            fontStyle: hasBrandFont ? 'italic' : 'normal',
            color: 'rgba(245, 241, 232, 0.72)',
          }}
        >
          Slow burn. Bright finish.
        </div>
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 56,
            fontSize: 16,
            letterSpacing: 6,
            color: 'rgba(245, 241, 232, 0.4)',
            textTransform: 'uppercase',
          }}
        >
          Specialty coffee · Roasted in the UK
        </div>
      </div>
    ),
    {
      ...size,
      ...(fonts.length > 0 ? { fonts } : {}),
    }
  );
}
