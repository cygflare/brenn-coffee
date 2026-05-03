'use client';

import Link from 'next/link';
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
        className="relative h-[400px] lg:h-[540px] flex items-center justify-center"
      >
        <BagIllustration />
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

function BagIllustration() {
  return (
    <svg viewBox="0 0 400 540" className="w-full h-full max-w-md">
      <defs>
        <linearGradient id="bag-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1614" />
          <stop offset="100%" stopColor="#0d0a09" />
        </linearGradient>
        <linearGradient id="bag-shine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="510" rx="140" ry="14" fill="#000" opacity="0.5" />
      <path
        d="M 100 120 L 110 100 L 290 100 L 300 120 L 310 500 L 90 500 Z"
        fill="url(#bag-grad)"
        stroke="#E8551C"
        strokeWidth="0.5"
        strokeOpacity="0.3"
      />
      <path
        d="M 100 120 L 110 100 L 290 100 L 300 120 L 310 500 L 90 500 Z"
        fill="url(#bag-shine)"
      />
      <rect x="110" y="100" width="180" height="20" fill="#0a0908" />
      <line x1="120" y1="110" x2="280" y2="110" stroke="#E8551C" strokeOpacity="0.4" />
      <circle cx="200" cy="200" r="3" fill="#E8551C" />
      <text
        x="200"
        y="240"
        textAnchor="middle"
        fill="#E8551C"
        fontFamily="serif"
        fontSize="11"
        letterSpacing="4"
      >
        SINGLE ORIGIN
      </text>
      <text
        x="200"
        y="290"
        textAnchor="middle"
        fill="#f5efe2"
        fontFamily="serif"
        fontSize="32"
        fontStyle="italic"
      >
        Yirgacheffe
      </text>
      <text
        x="200"
        y="320"
        textAnchor="middle"
        fill="#e8e2d6"
        fontFamily="serif"
        fontSize="14"
        letterSpacing="3"
      >
        ETHIOPIA
      </text>
      <line x1="150" y1="345" x2="250" y2="345" stroke="#E8551C" strokeOpacity="0.5" />
      <text
        x="200"
        y="375"
        textAnchor="middle"
        fill="#e8e2d6"
        fontSize="10"
        letterSpacing="2"
        opacity="0.6"
      >
        JASMINE · BERGAMOT · PEACH
      </text>
      <text
        x="200"
        y="430"
        textAnchor="middle"
        fill="#E8551C"
        fontFamily="serif"
        fontSize="14"
        fontStyle="italic"
      >
        light roast
      </text>
      <text
        x="200"
        y="475"
        textAnchor="middle"
        fill="#e8e2d6"
        fontSize="9"
        letterSpacing="3"
        opacity="0.4"
      >
        250G · WHOLE BEAN
      </text>
    </svg>
  );
}
