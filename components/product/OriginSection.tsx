import type { Product } from '@/lib/types';

export function OriginSection({ product }: { product: Product }) {
  return (
    <section className="container-x py-14 lg:py-20 border-t border-bone-200/15">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="aspect-square bg-ink-700 border border-bone-200/15 p-10 lg:p-12">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <defs>
              <radialGradient id="origin-glow" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#E8551C" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#E8551C" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g opacity="0.15" stroke="currentColor" strokeWidth="0.3" fill="none" className="text-bone-200">
              <line x1="0" y1="100" x2="400" y2="100" />
              <line x1="0" y1="200" x2="400" y2="200" />
              <line x1="0" y1="300" x2="400" y2="300" />
              <line x1="100" y1="0" x2="100" y2="400" />
              <line x1="200" y1="0" x2="200" y2="400" />
              <line x1="300" y1="0" x2="300" y2="400" />
            </g>
            <circle cx="200" cy="200" r="60" fill="url(#origin-glow)" />
            <circle cx="200" cy="200" r="6" fill="#E8551C" />
            <circle
              cx="200"
              cy="200"
              r="14"
              fill="none"
              stroke="#E8551C"
              strokeWidth="0.8"
              strokeOpacity="0.6"
            >
              <animate
                attributeName="r"
                values="6;24;6"
                dur="2.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-opacity"
                values="0.8;0;0.8"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </circle>
            <text
              x="200"
              y="260"
              textAnchor="middle"
              fill="#E8551C"
              fontFamily="serif"
              fontSize="18"
              fontStyle="italic"
            >
              {product.origin}
            </text>
            {product.altitude_m && (
              <text
                x="200"
                y="280"
                textAnchor="middle"
                fill="currentColor"
                className="text-bone-200/70"
                fontSize="10"
                letterSpacing="3"
              >
                {product.altitude_m}M ELEVATION
              </text>
            )}
          </svg>
        </div>

        <div>
          <div className="eyebrow mb-4">From the source</div>
          <h3 className="font-serif text-3xl lg:text-5xl text-bone-100 mb-6 leading-[1.1]">
            Grown by hand. Roasted with care.
          </h3>
          {product.description && (
            <p className="text-bone-200/70 leading-[1.8] mb-5">{product.description}</p>
          )}

          <div className="grid grid-cols-2 gap-6 mt-10 pt-8 border-t border-bone-200/15">
            {product.farm_name && (
              <Stat label="Farm" value={product.farm_name} />
            )}
            {product.farmer_name && (
              <Stat label="Farmer" value={product.farmer_name} />
            )}
            {product.variety && (
              <Stat label="Variety" value={product.variety} />
            )}
            {product.process && (
              <Stat label="Process" value={product.process} />
            )}
            {product.cupping_score && (
              <Stat label="Cupping score" value={`${product.cupping_score} pts`} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs tracking-[0.2em] uppercase text-bone-200/70 mb-2">
        {label}
      </div>
      <div className="font-serif text-xl lg:text-2xl italic text-ember">{value}</div>
    </div>
  );
}
