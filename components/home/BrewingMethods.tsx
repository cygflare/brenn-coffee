'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const METHODS = [
  {
    num: '01',
    name: 'Pour over',
    desc: 'Clarity, brightness, and nuance. Best with light roasts.',
    svg: (
      <g>
        <path d="M 80 60 L 160 60 L 150 100 L 90 100 Z" fill="none" stroke="#E8551C" strokeWidth="1" strokeOpacity="0.6"/>
        <path d="M 95 100 L 145 100 L 140 130 L 100 130 Z" fill="#E8551C" fillOpacity="0.15" stroke="#E8551C" strokeWidth="0.5" strokeOpacity="0.4"/>
        <path d="M 120 130 Q 120 150 120 170" stroke="#E8551C" strokeWidth="1" fill="none" strokeDasharray="2 3"/>
        <ellipse cx="120" cy="195" rx="40" ry="8" fill="none" stroke="#E8551C" strokeWidth="1" strokeOpacity="0.6"/>
        <ellipse cx="120" cy="195" rx="35" ry="6" fill="#E8551C" fillOpacity="0.2"/>
      </g>
    ),
  },
  {
    num: '02',
    name: 'Espresso',
    desc: 'Concentrated intensity. Foundation of milk drinks.',
    svg: (
      <g>
        <rect x="80" y="60" width="80" height="50" fill="none" stroke="#E8551C" strokeWidth="1" strokeOpacity="0.6"/>
        <rect x="90" y="110" width="60" height="30" fill="#E8551C" fillOpacity="0.15" stroke="#E8551C" strokeWidth="0.5" strokeOpacity="0.4"/>
        <circle cx="100" cy="80" r="4" fill="#E8551C" fillOpacity="0.5"/>
        <circle cx="120" cy="80" r="4" fill="#E8551C" fillOpacity="0.5"/>
        <circle cx="140" cy="80" r="4" fill="#E8551C" fillOpacity="0.5"/>
        <path d="M 90 160 L 90 180 L 150 180 L 150 160" fill="none" stroke="#E8551C" strokeOpacity="0.6"/>
      </g>
    ),
  },
  {
    num: '03',
    name: 'French press',
    desc: 'Heavy body, oils preserved. Robust and full-flavored.',
    svg: (
      <g>
        <rect x="85" y="50" width="70" height="120" rx="2" fill="none" stroke="#E8551C" strokeWidth="1" strokeOpacity="0.6"/>
        <rect x="90" y="100" width="60" height="65" fill="#E8551C" fillOpacity="0.2"/>
        <line x1="120" y1="55" x2="120" y2="100" stroke="#E8551C" strokeOpacity="0.4"/>
        <circle cx="120" cy="55" r="6" fill="none" stroke="#E8551C" strokeOpacity="0.6"/>
      </g>
    ),
  },
  {
    num: '04',
    name: 'Cold brew',
    desc: 'Smooth, low-acid, naturally sweet. Steeped 18 hours.',
    svg: (
      <g>
        <path d="M 90 60 L 90 180 Q 90 195 105 195 L 135 195 Q 150 195 150 180 L 150 60 Z" fill="none" stroke="#E8551C" strokeWidth="1" strokeOpacity="0.6"/>
        <path d="M 95 80 L 95 178 Q 95 190 107 190 L 133 190 Q 145 190 145 178 L 145 80 Z" fill="#E8551C" fillOpacity="0.15"/>
        <line x1="80" y1="60" x2="160" y2="60" stroke="#E8551C" strokeOpacity="0.6"/>
      </g>
    ),
  },
];

export function BrewingMethods() {
  const [active, setActive] = useState(0);

  return (
    <section className="container-x py-24 lg:py-32 border-t border-bone-200/8">
      <div className="mb-14">
        <div className="eyebrow mb-4">The ritual</div>
        <h2 className="font-serif text-4xl lg:text-6xl text-bone-100 leading-none">
          Find your perfect brew.
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col">
          {METHODS.map((m, idx) => (
            <button
              key={m.num}
              onMouseEnter={() => setActive(idx)}
              onClick={() => setActive(idx)}
              className={`group grid grid-cols-[60px_1fr_auto] gap-6 py-6 border-b border-bone-200/8 text-left transition-all ${
                active === idx ? 'pl-3' : 'hover:pl-3'
              }`}
            >
              <span
                className={`font-serif text-xl transition-colors ${
                  active === idx ? 'text-ember' : 'text-bone-200/30 group-hover:text-ember'
                }`}
              >
                {m.num}
              </span>
              <div>
                <div className="font-serif text-2xl text-bone-100 mb-1">{m.name}</div>
                <div className="text-sm text-bone-200/55">{m.desc}</div>
              </div>
              <span
                className={`self-center transition-all ${
                  active === idx
                    ? 'text-ember translate-x-2'
                    : 'text-bone-200/30 group-hover:text-ember group-hover:translate-x-2'
                }`}
              >
                →
              </span>
            </button>
          ))}
        </div>

        <div className="aspect-square bg-ink-600 border border-bone-200/8 flex items-center justify-center p-12 relative">
          <AnimatePresence mode="wait">
            <motion.svg
              key={active}
              viewBox="0 0 240 240"
              className="w-full h-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              {METHODS[active].svg}
              <text
                x="120"
                y="225"
                textAnchor="middle"
                fill="#E8551C"
                fontFamily="serif"
                fontSize="11"
                fontStyle="italic"
                opacity="0.7"
              >
                {METHODS[active].name.toLowerCase()}
              </text>
            </motion.svg>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
