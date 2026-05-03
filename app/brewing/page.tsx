export const metadata = { title: 'Brewing guides — Brenn Coffee' };

const GUIDES = [
  {
    name: 'Pour over',
    desc: 'The cleanest, most articulate way to brew coffee. Light roasts shine here.',
    ratio: '1:16',
    grind: 'Medium-fine',
    time: '3:30',
    bestFor: 'Light & medium roasts',
  },
  {
    name: 'Espresso',
    desc: 'Concentrated, syrupy, and intense. The foundation of every milk-based drink.',
    ratio: '1:2',
    grind: 'Fine',
    time: '28 sec',
    bestFor: 'Medium-dark & dark roasts',
  },
  {
    name: 'French press',
    desc: 'Heavy body and full mouthfeel. Preserves the natural oils for a richer cup.',
    ratio: '1:15',
    grind: 'Coarse',
    time: '4:00',
    bestFor: 'Medium & dark roasts',
  },
  {
    name: 'Cold brew',
    desc: 'Smooth, naturally sweet, low in acidity. Made by patience, not heat.',
    ratio: '1:8',
    grind: 'Coarse',
    time: '18 hr',
    bestFor: 'Medium-dark & dark roasts',
  },
];

export default function BrewingPage() {
  return (
    <div className="container-x py-16 lg:py-24">
      <div className="max-w-3xl mb-16">
        <div className="eyebrow mb-4">The ritual</div>
        <h1 className="font-serif text-5xl lg:text-7xl text-bone-100 leading-[0.95] mb-6">
          Brewing <em className="italic text-ember">guides</em>.
        </h1>
        <p className="text-lg text-bone-200/70 leading-relaxed">
          Four methods. Four philosophies. Choose based on what you want from the cup —
          clarity, intensity, body, or smoothness.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {GUIDES.map((g) => (
          <div
            key={g.name}
            className="border border-bone-200/8 bg-ink-700 p-8 hover:border-ember/40 transition-colors"
          >
            <h2 className="font-serif text-3xl text-bone-100 mb-3">{g.name}</h2>
            <p className="text-sm text-bone-200/65 leading-relaxed mb-7">{g.desc}</p>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-bone-200/8 mb-5">
              <div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-bone-200/45 mb-1">
                  Ratio
                </div>
                <div className="font-serif italic text-ember text-lg">{g.ratio}</div>
              </div>
              <div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-bone-200/45 mb-1">
                  Grind
                </div>
                <div className="font-serif italic text-ember text-lg">{g.grind}</div>
              </div>
              <div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-bone-200/45 mb-1">
                  Time
                </div>
                <div className="font-serif italic text-ember text-lg">{g.time}</div>
              </div>
            </div>

            <div className="text-xs text-bone-200/50">
              <span className="text-bone-200/40">Best for: </span>
              {g.bestFor}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 border border-ember/30 bg-ember/[0.04] text-center">
        <p className="font-serif italic text-xl text-bone-100 mb-2">
          Detailed step-by-step guides coming soon.
        </p>
        <p className="text-sm text-bone-200/60">
          We're filming brewing tutorials with our head roaster. In the meantime, the
          ratios above are tested and reliable.
        </p>
      </div>
    </div>
  );
}
