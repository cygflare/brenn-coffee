export function StorySection() {
  return (
    <section className="container-x py-24 lg:py-32 border-t border-bone-200/8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="aspect-[4/5] bg-ink-600 border border-bone-200/8 relative overflow-hidden flex items-center justify-center">
          <svg viewBox="0 0 400 500" className="w-full h-full">
            <defs>
              <radialGradient id="story-glow" cx="50%" cy="40%">
                <stop offset="0%" stopColor="#E8551C" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#E8551C" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="400" height="500" fill="#0d0a09" />
            <circle cx="200" cy="200" r="180" fill="url(#story-glow)" />
            <g opacity="0.7">
              <ellipse cx="180" cy="240" rx="22" ry="32" fill="#3a2818" transform="rotate(-15 180 240)" />
              <ellipse cx="220" cy="260" rx="22" ry="32" fill="#2a1d12" transform="rotate(25 220 260)" />
              <ellipse cx="200" cy="290" rx="22" ry="32" fill="#3a2818" transform="rotate(5 200 290)" />
              <ellipse cx="160" cy="290" rx="20" ry="28" fill="#2a1d12" transform="rotate(40 160 290)" />
              <ellipse cx="240" cy="220" rx="20" ry="28" fill="#3a2818" transform="rotate(-30 240 220)" />
              <ellipse cx="150" cy="200" rx="18" ry="26" fill="#2a1d12" transform="rotate(20 150 200)" />
              <ellipse cx="250" cy="290" rx="18" ry="26" fill="#3a2818" transform="rotate(-10 250 290)" />
            </g>
            <text
              x="200"
              y="430"
              textAnchor="middle"
              fill="#E8551C"
              fontFamily="serif"
              fontSize="13"
              letterSpacing="4"
              opacity="0.7"
            >
              EST. MMXXIV
            </text>
          </svg>
        </div>

        <div>
          <div className="eyebrow mb-4">Our craft</div>
          <h2 className="font-serif text-4xl lg:text-5xl text-bone-100 mb-8 leading-[1.1]">
            From bean to cup, with intention.
          </h2>
          <p className="text-base text-bone-200/70 leading-[1.8] mb-6">
            We started Brenn in a converted warehouse in East London, with a single Probat
            roaster and a stubborn belief that great coffee should be honest. No shortcuts,
            no marketing fluff.
          </p>
          <blockquote className="font-serif italic text-2xl leading-snug text-bone-100 py-8 my-8 border-y border-bone-200/10">
            &ldquo;Every bean has a story. Our job is to listen carefully enough to tell it
            without getting in the way.&rdquo;
          </blockquote>
          <p className="text-base text-bone-200/70 leading-[1.8] mb-6">
            We work directly with twelve farms across three continents. We pay above Fair
            Trade prices because the people who grow our coffee deserve more than a label.
          </p>
          <div className="font-serif italic text-ember text-lg">
            — Marcus &amp; Elena, founders
          </div>
        </div>
      </div>
    </section>
  );
}
