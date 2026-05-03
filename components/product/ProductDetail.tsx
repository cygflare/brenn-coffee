'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-store';
import {
  GRIND_LABELS,
  SIZE_LABELS,
  type GrindType,
  type ProductWithVariants,
  type SizeGrams,
} from '@/lib/types';
import { formatPrice, roastLabel, SUBSCRIPTION_DISCOUNT } from '@/lib/utils';
import { Plus, Minus, Truck, Clock, Leaf, type LucideIcon } from 'lucide-react';
import { FlavorWheel } from './FlavorWheel';
import { BrewRecommendations } from './BrewRecommendations';
import { OriginSection } from './OriginSection';

export function ProductDetail({ product }: { product: ProductWithVariants }) {
  const addItem = useCart((s) => s.addItem);

  // Available sizes and grinds from variants
  const sizes = useMemo(
    () =>
      Array.from(new Set(product.variants.map((v) => v.size_g))).sort((a, b) => a - b) as SizeGrams[],
    [product.variants]
  );
  const grinds = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.grind))) as GrindType[],
    [product.variants]
  );

  const [selectedGrind, setSelectedGrind] = useState<GrindType>(
    grinds.includes('whole_bean') ? 'whole_bean' : grinds[0]
  );
  const [selectedSize, setSelectedSize] = useState<SizeGrams>(
    sizes.includes(250 as SizeGrams) ? (250 as SizeGrams) : sizes[0]
  );
  const [qty, setQty] = useState(1);
  const [isSubscription, setIsSubscription] = useState(false);

  // Find matching variant
  const activeVariant = useMemo(() => {
    return (
      product.variants.find(
        (v) => v.size_g === selectedSize && v.grind === selectedGrind
      ) ??
      product.variants.find((v) => v.size_g === selectedSize) ??
      product.variants[0]
    );
  }, [product.variants, selectedSize, selectedGrind]);

  const unitPrice = activeVariant?.price_pence ?? product.price_pence;
  const effectivePrice = isSubscription
    ? unitPrice * (1 - SUBSCRIPTION_DISCOUNT)
    : unitPrice;
  const totalPrice = effectivePrice * qty;

  const handleAddToCart = () => {
    if (!activeVariant) return;
    addItem({
      variantId: activeVariant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      size_g: activeVariant.size_g,
      grind: activeVariant.grind,
      unitPricePence: unitPrice,
      quantity: qty,
      isSubscription,
    });
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="container-x py-6 text-xs tracking-[0.1em] text-bone-200/65">
        <Link href="/shop" className="hover:text-ember">
          Shop
        </Link>{' '}
        / Single origin / <span className="text-ember">{product.name}</span>
      </div>

      {/* Hero: gallery + info */}
      <section className="container-x grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 pb-20">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="aspect-[4/5] bg-gradient-to-b from-ink-500 to-ink-900 border border-bone-200/15 relative flex items-center justify-center overflow-hidden">
            {product.hero_image_url ? (
              <Image
                src={product.hero_image_url}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <>
                <div className="absolute w-3/5 h-3/5 bg-ember/20 blur-3xl pointer-events-none" />
                <ProductBag product={product} />
              </>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="pt-2">
          {product.is_limited && (
            <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-ember mb-5 px-3 py-1.5 border border-ember/40 bg-ember/5">
              <span className="w-1.5 h-1.5 rounded-full bg-ember" />
              Limited release · Spring 2026
            </div>
          )}

          <div className="text-[11px] tracking-[0.3em] uppercase text-bone-200/70 mb-4">
            {product.origin}
          </div>

          <h1 className="font-serif text-5xl lg:text-7xl text-bone-100 leading-[0.95] tracking-tight mb-3">
            <em className="italic text-ember">{product.name}</em>
          </h1>

          {product.tagline && (
            <div className="font-serif italic text-xl lg:text-2xl text-bone-200/85 mb-7">
              {product.tagline}
            </div>
          )}

          <div className="flex items-baseline gap-4 mb-8 pb-8 border-b border-bone-200/15">
            <span className="font-serif text-4xl text-bone-100">
              {formatPrice(unitPrice)}
            </span>
            <span className="text-xs tracking-[0.15em] uppercase text-bone-200/65">
              / {SIZE_LABELS[selectedSize]} {GRIND_LABELS[selectedGrind].toLowerCase()}
            </span>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-3 border border-bone-200/15 mb-9">
            <MetaCell label="Roast level" value={roastLabel(product.roast_level)} />
            <MetaCell label="Process" value={product.process ?? '—'} />
            <MetaCell
              label="Altitude"
              value={product.altitude_m ? `${product.altitude_m}m` : '—'}
            />
          </div>

          {/* Grind selector */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] tracking-[0.2em] uppercase text-bone-200/65">
                Grind
              </span>
              <span className="text-sm text-ember font-serif italic">
                {GRIND_LABELS[selectedGrind]}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {grinds.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGrind(g)}
                  className={`px-4 py-3 text-xs tracking-[0.08em] uppercase border transition-all ${
                    selectedGrind === g
                      ? 'bg-ember border-ember text-ink-900'
                      : 'border-bone-200/15 text-bone-200/70 hover:border-ember/50 hover:text-bone-200'
                  }`}
                >
                  {GRIND_LABELS[g]}
                </button>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] tracking-[0.2em] uppercase text-bone-200/65">Size</span>
              <span className="text-sm text-ember font-serif italic">
                {SIZE_LABELS[selectedSize]}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                const v = product.variants.find(
                  (v) => v.size_g === s && v.grind === selectedGrind
                );
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-3 text-xs tracking-[0.08em] uppercase border transition-all ${
                      selectedSize === s
                        ? 'bg-ember border-ember text-ink-900'
                        : 'border-bone-200/15 text-bone-200/70 hover:border-ember/50 hover:text-bone-200'
                    }`}
                  >
                    {SIZE_LABELS[s]} · {v ? formatPrice(v.price_pence) : '—'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subscription toggle */}
          <button
            onClick={() => setIsSubscription(!isSubscription)}
            className="w-full flex items-center gap-4 p-5 border border-ember/30 bg-ember/[0.04] hover:bg-ember/[0.08] transition-colors mb-6 text-left"
          >
            <div className="w-5 h-5 border border-ember flex items-center justify-center flex-shrink-0">
              {isSubscription && <div className="w-2.5 h-2.5 bg-ember" />}
            </div>
            <div className="flex-1">
              <div className="text-sm text-bone-100 font-medium mb-1">Subscribe &amp; save</div>
              <div className="text-xs text-bone-200/75">
                Fresh bag every 2 weeks. Skip or cancel anytime.
              </div>
            </div>
            <div className="font-serif italic text-ember">— 15%</div>
          </button>

          {/* Quantity + Add to cart */}
          <div className="grid grid-cols-[auto_1fr] gap-4 mb-8">
            <div className="flex items-center border border-bone-200/15">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-11 h-13 px-3 hover:text-ember"
                aria-label="Decrease"
              >
                <Minus size={14} />
              </button>
              <span className="w-11 text-center font-serif text-lg italic">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-11 h-13 px-3 hover:text-ember"
                aria-label="Increase"
              >
                <Plus size={14} />
              </button>
            </div>
            <button onClick={handleAddToCart} className="btn-primary">
              Add to cart · {formatPrice(totalPrice)}
            </button>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-bone-200/15">
            <Perk icon={Truck} label="Free UK shipping over £30" />
            <Perk icon={Clock} label="Roasted to order in 48hr" />
            <Perk icon={Leaf} label="Direct trade & ethical" />
          </div>
        </div>
      </section>

      {/* Tasting profile */}
      {product.flavor_notes.length > 0 && (
        <section className="container-x py-14 lg:py-20 border-t border-bone-200/15">
          <div className="eyebrow mb-4">Tasting profile</div>
          <h2 className="font-serif text-4xl lg:text-6xl text-bone-100 leading-none mb-16">
            A spectrum of <em className="italic text-ember">flavor</em>, mapped.
          </h2>
          <FlavorWheel product={product} />
        </section>
      )}

      <BrewRecommendations product={product} />

      {(product.farm_name || product.farmer_name) && (
        <OriginSection product={product} />
      )}
    </>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4 border-r last:border-r-0 border-bone-200/15">
      <div className="text-[10px] tracking-[0.2em] uppercase text-bone-200/65 mb-1.5">
        {label}
      </div>
      <div className="font-serif text-lg text-bone-100">{value}</div>
    </div>
  );
}

function Perk({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="flex items-start gap-2 text-xs text-bone-200/75 leading-relaxed">
      <Icon size={14} className="text-ember flex-shrink-0 mt-0.5" />
      <span>{label}</span>
    </div>
  );
}

function ProductBag({ product }: { product: ProductWithVariants }) {
  return (
    <svg viewBox="0 0 400 500" className="w-3/4 h-3/4 relative z-10">
      <defs>
        <linearGradient id="pdp-bag" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1f1a16" />
          <stop offset="100%" stopColor="#0c0a08" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="475" rx="130" ry="10" fill="#000" opacity="0.6" />
      <path
        d="M 100 110 L 110 90 L 290 90 L 300 110 L 310 470 L 90 470 Z"
        fill="url(#pdp-bag)"
        stroke="#E8551C"
        strokeWidth="0.5"
        strokeOpacity="0.4"
      />
      <rect x="110" y="90" width="180" height="20" fill="#0a0908" />
      <line x1="120" y1="100" x2="280" y2="100" stroke="#E8551C" strokeOpacity="0.5" />
      <circle cx="200" cy="170" r="3" fill="#E8551C" />
      <text
        x="200"
        y="210"
        textAnchor="middle"
        fill="#E8551C"
        fontFamily="serif"
        fontSize="11"
        letterSpacing="5"
      >
        SINGLE ORIGIN
      </text>
      <text
        x="200"
        y="270"
        textAnchor="middle"
        fill="#f5f0e6"
        fontFamily="serif"
        fontSize="44"
        fontStyle="italic"
      >
        {product.name}
      </text>
      <text
        x="200"
        y="300"
        textAnchor="middle"
        fill="#ebe6dd"
        fontFamily="serif"
        fontSize="13"
        letterSpacing="4"
      >
        {(product.country ?? '').toUpperCase()}
      </text>
      <line x1="160" y1="320" x2="240" y2="320" stroke="#E8551C" strokeOpacity="0.6" />
      <text
        x="200"
        y="350"
        textAnchor="middle"
        fill="#ebe6dd"
        fontSize="9"
        letterSpacing="3"
        opacity="0.7"
      >
        {product.flavor_notes.slice(0, 3).join(' · ').toUpperCase()}
      </text>
      <text
        x="200"
        y="400"
        textAnchor="middle"
        fill="#E8551C"
        fontFamily="serif"
        fontSize="14"
        fontStyle="italic"
      >
        {roastLabel(product.roast_level).toLowerCase()} roast
      </text>
    </svg>
  );
}
