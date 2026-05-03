'use client';

import type { Product } from '@/lib/types';

const FLAVOR_CATEGORIES = [
  { name: 'Chocolate', angle: 0, key: 'chocolate', subs: ['Dark choc', 'Cocoa', 'Toffee'] },
  { name: 'Fruity', angle: 60, key: 'fruity', subs: ['Cherry', 'Berry', 'Citrus'] },
  { name: 'Floral', angle: 120, key: 'floral', subs: ['Jasmine', 'Rose', 'Tea'] },
  { name: 'Spicy', angle: 180, key: 'spicy', subs: ['Pepper', 'Clove', 'Tobacco'] },
  { name: 'Nutty', angle: 240, key: 'nutty', subs: ['Almond', 'Hazelnut', 'Walnut'] },
  { name: 'Woody', angle: 300, key: 'woody', subs: ['Cedar', 'Oak', 'Smoke'] },
];

// Auto-detect categories from flavor_notes
function getCategoriesForProduct(notes: string[]): Set<string> {
  const lower = notes.map((n) => n.toLowerCase()).join(' ');
  const result = new Set<string>();
  if (/chocolat|cocoa|toffee|caramel/.test(lower)) result.add('chocolate');
  if (/cherry|berry|citrus|peach|fig|fruit|lemon|orange|apple/.test(lower)) result.add('fruity');
  if (/jasmine|rose|tea|floral|bergamot/.test(lower)) result.add('floral');
  if (/pepper|clove|tobacco|spice|spicy/.test(lower)) result.add('spicy');
  if (/almond|hazelnut|walnut|nut|nutty/.test(lower)) result.add('nutty');
  if (/cedar|oak|smoke|woody|wood/.test(lower)) result.add('woody');
  return result;
}

export function FlavorWheel({ product }: { product: Product }) {
  const activeCategories = getCategoriesForProduct(product.flavor_notes);

  const bars = [
    { label: 'Body', value: product.body },
    { label: 'Acidity', value: product.acidity },
    { label: 'Sweetness', value: product.sweetness },
    { label: 'Bitterness', value: product.bitterness },
    { label: 'Aroma', value: product.aroma },
  ].filter((b) => b.value !== null) as { label: string; value: number }[];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className="aspect-square max-w-md mx-auto w-full">
        <svg viewBox="-250 -250 500 500" className="w-full h-full">
          {FLAVOR_CATEGORIES.map((cat) => {
            const isActive = activeCategories.has(cat.key);
            const start = ((cat.angle - 30) * Math.PI) / 180;
            const end = ((cat.angle + 30) * Math.PI) / 180;
            const r1 = 80;
            const r2 = 145;
            const x1 = Math.cos(start) * r1;
            const y1 = Math.sin(start) * r1;
            const x2 = Math.cos(end) * r1;
            const y2 = Math.sin(end) * r1;
            const x3 = Math.cos(end) * r2;
            const y3 = Math.sin(end) * r2;
            const x4 = Math.cos(start) * r2;
            const y4 = Math.sin(start) * r2;

            const labelR = 113;
            const lx = Math.cos((cat.angle * Math.PI) / 180) * labelR;
            const ly = Math.sin((cat.angle * Math.PI) / 180) * labelR;

            return (
              <g key={cat.key}>
                <path
                  d={`M ${x1} ${y1} A ${r1} ${r1} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${r2} ${r2} 0 0 0 ${x4} ${y4} Z`}
                  fill={isActive ? 'rgba(232,85,28,0.18)' : 'rgba(232,85,28,0.04)'}
                  stroke="#E8551C"
                  strokeWidth="0.5"
                  strokeOpacity={isActive ? 0.6 : 0.2}
                />
                <text
                  x={lx}
                  y={ly + 3}
                  textAnchor="middle"
                  fill={isActive ? '#E8551C' : 'rgba(235,230,221,0.5)'}
                  fontFamily="serif"
                  fontStyle="italic"
                  fontSize="12"
                >
                  {cat.name}
                </text>
              </g>
            );
          })}
          {/* Center */}
          <circle cx="0" cy="0" r="60" fill="#0f0d0c" stroke="#E8551C" strokeWidth="1" strokeOpacity="0.5" />
          <text
            x="0"
            y="-8"
            textAnchor="middle"
            fill="#E8551C"
            fontFamily="serif"
            fontSize="14"
            fontStyle="italic"
          >
            {product.name}
          </text>
          <text
            x="0"
            y="10"
            textAnchor="middle"
            fill="rgba(235,230,221,0.6)"
            fontSize="9"
            letterSpacing="2"
          >
            PROFILE
          </text>
          {product.cupping_score && (
            <text
              x="0"
              y="28"
              textAnchor="middle"
              fill="#f5f0e6"
              fontFamily="serif"
              fontSize="11"
            >
              {product.cupping_score} pts
            </text>
          )}
        </svg>
      </div>

      <div>
        <h3 className="font-serif text-3xl text-bone-100 mb-5">
          Tasting notes &amp; profile
        </h3>
        {product.description && (
          <p className="text-bone-200/70 leading-[1.7] mb-7">{product.description}</p>
        )}
        <div className="flex flex-wrap gap-2 mb-8">
          {product.flavor_notes.map((note) => (
            <span
              key={note}
              className="text-[11px] tracking-[0.15em] uppercase px-3.5 py-2 border border-ember/40 text-ember"
            >
              {note}
            </span>
          ))}
        </div>
        <div className="space-y-3.5">
          {bars.map((bar) => (
            <div
              key={bar.label}
              className="grid grid-cols-[100px_1fr_30px] gap-4 items-center text-xs tracking-[0.1em] uppercase text-bone-200/70"
            >
              <span>{bar.label}</span>
              <div className="h-1 bg-bone-200/8 relative">
                <div
                  className="h-full bg-ember transition-[width] duration-1000 ease-out"
                  style={{ width: `${bar.value * 10}%` }}
                />
              </div>
              <span className="font-serif italic text-ember text-sm">{bar.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
