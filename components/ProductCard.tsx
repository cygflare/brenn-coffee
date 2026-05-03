'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Product } from '@/lib/types';
import { formatPrice, roastLabel } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  const tag = product.is_limited
    ? 'Limited'
    : product.is_featured
    ? 'Bestseller'
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="bg-ink-600 border border-bone-200/10 hover:border-ember/40 transition-colors group"
    >
      <Link href={`/product/${product.slug}`}>
        <div className="aspect-[4/5] relative overflow-hidden bg-ink-700 flex items-center justify-center">
          {tag && (
            <span className="absolute top-4 left-4 z-10 text-[10px] tracking-[0.2em] uppercase text-ember bg-ink-900/70 px-2.5 py-1.5 backdrop-blur-sm">
              {tag}
            </span>
          )}
          <BagSvg product={product} />
        </div>

        <div className="p-6">
          <div className="text-[11px] tracking-[0.2em] uppercase text-bone-200/50 mb-2">
            {product.origin}
          </div>
          <div className="font-serif text-2xl text-bone-100 mb-3">{product.name}</div>

          {/* Roast meter */}
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((dot) => (
              <span
                key={dot}
                className={`w-4 h-1 ${
                  dot <= product.roast_level ? 'bg-ember' : 'bg-bone-200/15'
                }`}
              />
            ))}
          </div>

          {product.flavor_notes.length > 0 && (
            <p className="text-sm text-bone-200/60 leading-relaxed mb-5 line-clamp-2">
              {product.flavor_notes.slice(0, 3).join(', ')}.{' '}
              {roastLabel(product.roast_level)} roast.
            </p>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-bone-200/8">
            <span className="font-serif text-xl text-ember">
              {formatPrice(product.price_pence)}
            </span>
            <span className="text-[11px] tracking-[0.12em] uppercase text-bone-200 border border-bone-200/20 px-3 py-1.5 group-hover:bg-ember group-hover:text-ink-900 group-hover:border-ember transition-colors">
              View →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function BagSvg({ product }: { product: Product }) {
  return (
    <svg viewBox="0 0 200 250" className="w-3/5 h-3/5 transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2">
      <path
        d="M 50 50 L 55 40 L 145 40 L 150 50 L 155 230 L 45 230 Z"
        fill="#1a1614"
        stroke="#E8551C"
        strokeWidth="0.5"
        strokeOpacity="0.4"
      />
      <text
        x="100"
        y="120"
        textAnchor="middle"
        fill="#E8551C"
        fontFamily="serif"
        fontSize="9"
        letterSpacing="3"
      >
        {(product.country ?? '').toUpperCase()}
      </text>
      <text
        x="100"
        y="150"
        textAnchor="middle"
        fill="#f5efe2"
        fontFamily="serif"
        fontSize="20"
        fontStyle="italic"
      >
        {product.name}
      </text>
      <line x1="70" y1="170" x2="130" y2="170" stroke="#E8551C" strokeOpacity="0.5" />
      <text
        x="100"
        y="195"
        textAnchor="middle"
        fill="#e8e2d6"
        fontSize="7"
        opacity="0.6"
        letterSpacing="2"
      >
        {roastLabel(product.roast_level).toUpperCase()} ROAST
      </text>
    </svg>
  );
}
