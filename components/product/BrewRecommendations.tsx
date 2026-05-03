'use client';

import type { Product } from '@/lib/types';

const ALL_BREWS = [
  {
    key: 'espresso',
    name: 'Espresso',
    detail: 'Concentrated, syrupy, with crema like burnt sugar.',
    ratio: '1:2',
    time: '28s',
    bestForRoasts: [3, 4, 5],
  },
  {
    key: 'french_press',
    name: 'French press',
    detail: 'Heavy body, full chocolate notes, rich texture.',
    ratio: '1:15',
    time: '4 min',
    bestForRoasts: [3, 4, 5],
  },
  {
    key: 'pour_over',
    name: 'Pour over',
    detail: 'Lighter body, brings out fruit and floral notes.',
    ratio: '1:16',
    time: '3.5 min',
    bestForRoasts: [1, 2, 3],
  },
  {
    key: 'cold_brew',
    name: 'Cold brew',
    detail: 'Smooth and decadent. Steep at 1:8 ratio.',
    ratio: '1:8',
    time: '18 hr',
    bestForRoasts: [3, 4, 5],
  },
];

export function BrewRecommendations({ product }: { product: Product }) {
  // Score each brew method by how well it matches the roast
  const scored = ALL_BREWS.map((brew) => {
    const score = brew.bestForRoasts.includes(product.roast_level)
      ? brew.bestForRoasts[0] === product.roast_level ||
        brew.bestForRoasts[brew.bestForRoasts.length - 1] === product.roast_level
        ? 'great'
        : 'best'
      : null;
    return { ...brew, score };
  });

  // Mark top 1-2 as "best"/"great"
  const sorted = [...scored].sort((a, b) => {
    const order = { best: 2, great: 1, null: 0 } as Record<string, number>;
    return (order[String(b.score)] ?? 0) - (order[String(a.score)] ?? 0);
  });
  if (sorted[0].score) sorted[0].score = 'best';
  if (sorted[1] && sorted[1].score === 'best') sorted[1].score = 'great';

  return (
    <section className="container-x py-14 lg:py-20 border-t border-bone-200/15">
      <div className="eyebrow mb-4">Brewing recommendations</div>
      <h2 className="font-serif text-4xl lg:text-6xl text-bone-100 leading-none mb-14">
        Best <em className="italic text-ember">poured</em> like this.
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sorted.map((brew) => (
          <div
            key={brew.key}
            className={`relative p-7 transition-all hover:-translate-y-1 ${
              brew.score === 'best'
                ? 'border border-ember/50 bg-gradient-to-b from-ember/[0.06] to-transparent'
                : 'border border-bone-200/15 bg-ink-700 hover:border-ember/40'
            }`}
          >
            {brew.score === 'best' && (
              <span className="absolute -top-px -right-px bg-ember text-ink-900 text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 font-medium">
                Best match
              </span>
            )}
            {brew.score === 'great' && (
              <span className="absolute -top-px -right-px bg-ember/80 text-ink-900 text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 font-medium">
                Great
              </span>
            )}

            <div className="font-serif text-2xl text-bone-100 mb-2">{brew.name}</div>
            <p className="text-sm text-bone-200/75 leading-relaxed mb-5">{brew.detail}</p>

            <div className="pt-4 border-t border-bone-200/15 space-y-2.5">
              <div className="flex justify-between items-baseline">
                <span className="text-bone-200/70 tracking-[0.12em] uppercase text-xs">
                  Ratio
                </span>
                <span className="text-ember font-serif italic text-lg">{brew.ratio}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-bone-200/70 tracking-[0.12em] uppercase text-xs">
                  Time
                </span>
                <span className="text-ember font-serif italic text-lg">{brew.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
