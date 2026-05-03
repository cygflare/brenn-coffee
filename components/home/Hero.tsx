'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative min-h-[600px] grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center container-x py-20 lg:py-28 overflow-hidden">
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08]">
        <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
          <defs>
            <radialGradient id="hero-glow" cx="70%" cy="40%">
              <stop offset="0%" stopColor="#E8551C" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#E8551C" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="700" cy="240" r="320" fill="url(#hero-glow)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10"
      >
        <div className="eyebrow mb-6">Single origin · Spring 2026</div>

        <h1 className="font-serif text-5xl sm:text-6xl lg:text-[88px] leading-[0.95] tracking-tight text-bone-100 mb-6">
          Coffee, <em className="italic text-ember">distilled</em>
          <br />
          to its essence.
        </h1>

        <p className="text-base text-bone-200/70 max-w-lg leading-relaxed mb-10">
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

        <div className="grid grid-cols-3 gap-6 mt-14 pt-8 border-t border-bone-200/10 max-w-md">
          <Stat num="12" label="Origins" />
          <Stat num="48h" label="Roast to ship" />
          <Stat num="94+" label="Avg cupping" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        className="relative h-[400px] lg:h-[600px] overflow-hidden"
      >
        <Image
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&q=85"
          alt="Espresso pouring into a white cup"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover"
        />
        {/* subtle vignette to blend with the page */}
        <div className="absolute inset-0 bg-gradient-to-tr from-ink-900/40 via-transparent to-transparent pointer-events-none" />
      </motion.div>
    </section>
  );
}

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div>
      <div className="font-serif text-3xl text-ember leading-none">{num}</div>
      <div className="text-[10px] tracking-[0.15em] uppercase text-bone-200/50 mt-2">
        {label}
      </div>
    </div>
  );
}

