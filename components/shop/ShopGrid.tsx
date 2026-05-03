'use client';

import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/lib/types';

const ROAST_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Light', value: '1,2' },
  { label: 'Medium', value: '3' },
  { label: 'Dark', value: '4,5' },
];

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to high', value: 'price-asc' },
  { label: 'Price: High to low', value: 'price-desc' },
  { label: 'Cupping score', value: 'cupping' },
];

export function ShopGrid({ products }: { products: Product[] }) {
  const [roastFilter, setRoastFilter] = useState('all');
  const [originFilter, setOriginFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const origins = useMemo(() => {
    const set = new Set(products.map((p) => p.country).filter(Boolean) as string[]);
    return ['all', ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (roastFilter !== 'all') {
      const allowed = roastFilter.split(',').map(Number);
      result = result.filter((p) => allowed.includes(p.roast_level));
    }

    if (originFilter !== 'all') {
      result = result.filter((p) => p.country === originFilter);
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price_pence - b.price_pence);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price_pence - a.price_pence);
        break;
      case 'cupping':
        result.sort((a, b) => (b.cupping_score ?? 0) - (a.cupping_score ?? 0));
        break;
      default:
        result.sort(
          (a, b) => Number(b.is_featured) - Number(a.is_featured)
        );
    }

    return result;
  }, [products, roastFilter, originFilter, sortBy]);

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 mb-10 border-b border-bone-200/10">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.2em] uppercase text-bone-200/50 mr-2">
              Roast
            </span>
            {ROAST_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setRoastFilter(f.value)}
                className={`text-xs tracking-[0.1em] uppercase px-3 py-1.5 transition-colors ${
                  roastFilter === f.value
                    ? 'bg-ember text-ink-900'
                    : 'text-bone-200/65 hover:text-ember'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.2em] uppercase text-bone-200/50 mr-2">
              Origin
            </span>
            <select
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className="bg-transparent border border-bone-200/15 text-xs uppercase tracking-[0.1em] text-bone-200 px-3 py-1.5 outline-none hover:border-ember focus:border-ember cursor-pointer"
            >
              {origins.map((o) => (
                <option key={o} value={o} className="bg-ink-800">
                  {o === 'all' ? 'All origins' : o}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.2em] uppercase text-bone-200/50">Sort</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border border-bone-200/15 text-xs uppercase tracking-[0.1em] text-bone-200 px-3 py-1.5 outline-none hover:border-ember focus:border-ember cursor-pointer"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value} className="bg-ink-800">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-bone-200/45 mb-8">
        Showing {filtered.length} {filtered.length === 1 ? 'coffee' : 'coffees'}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-serif text-3xl text-bone-100 mb-2">No matches</p>
          <p className="text-bone-200/55 mb-6">Try adjusting your filters.</p>
          <button
            onClick={() => {
              setRoastFilter('all');
              setOriginFilter('all');
            }}
            className="btn-ghost"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
