'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center overflow-hidden">
      {/* Full-bleed atmospheric image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1800&q=85"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Two-axis gradient: stronger over the text on the left,
            keeps image visible on the right; deeper at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/80 to-ink-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
      </div>

      <div className="container-x relative z-10 section-y w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          <div className="eyebrow mb-6">Single origin · Spring 2026</div>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-[88px] leading-[0.95] tracking-tight text-bone-100 mb-6">
            Coffee, <em className="italic text-ember">distilled</em>
            <br />
            to its essence.
          </h1>

          <p className="text-base text-bone-200/75 max-w-lg leading-relaxed mb-10">
            Small-batch roasted beans sourced directly from independent farms across Ethiopia,
            Colombia, and Guatemala. Shipped within 48 hours of roasting.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <Link href="/shop" className="btn-primary">
              Shop the collection →
            </Link>
            <Link href="/about" className="btn-ghost">
              Our story
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-bone-200/15 max-w-md">
            <Stat num="12" label="Origins" />
            <Stat num="48h" label="Roast to ship" />
            <Stat num="94+" label="Avg cupping" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div>
      <div className="font-serif text-3xl text-ember leading-none">{num}</div>
      <div className="text-[10px] tracking-[0.15em] uppercase text-bone-200/60 mt-2">
        {label}
      </div>
    </div>
  );
}
