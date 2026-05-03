import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Brenn began in a converted East London warehouse with a single Probat roaster and a stubborn belief that great coffee should be honest. Read our story.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About · Brenn Coffee',
    description: 'Slow-roasted, direct-trade, small-batch coffee from East London.',
    url: '/about',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className="container-x py-16 lg:py-24 max-w-4xl">
      <div className="eyebrow mb-6">Our story</div>
      <h1 className="font-serif text-5xl lg:text-7xl text-bone-100 leading-[0.95] mb-12">
        Brenn — to <em className="italic text-ember">burn</em>, with intention.
      </h1>

      <div className="prose prose-invert max-w-none">
        <p className="text-xl text-bone-200/75 leading-relaxed mb-8">
          Brenn began in a converted East London warehouse with a single Probat roaster, a
          stack of green coffee bags, and a stubborn belief that great coffee should be
          honest. No marketing fluff. No shortcuts. Just beans, fire, and time.
        </p>

        <blockquote className="font-serif italic text-2xl lg:text-3xl text-bone-100 my-12 py-8 border-y border-bone-200/10 leading-snug">
          Every bean has a story. Our job is to listen carefully enough to tell it without
          getting in the way.
        </blockquote>

        <p className="text-base text-bone-200/70 leading-[1.8] mb-6">
          The name comes from the Old Norse <em className="italic">brenna</em> — to burn, to
          roast, to refine. It captures everything we believe about what we do: coffee at
          its best is the result of careful, patient transformation. We roast slow because
          fast roasting hides flaws under bitterness. We pay above Fair Trade because the
          people growing our coffee deserve more than a label.
        </p>

        <p className="text-base text-bone-200/70 leading-[1.8] mb-6">
          We work directly with twelve farms across Ethiopia, Colombia, Guatemala, Kenya,
          and Brazil. Every bag carries the name of the farmer who grew it. Every roast is
          dated. Every order ships within 48 hours of leaving the roaster.
        </p>

        <h2 className="font-serif text-3xl text-bone-100 mt-16 mb-6">What we believe</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { title: 'Slow over fast', body: 'Slow-roasted coffee develops more sugars and complex flavors. Fast roasting cuts corners.' },
            { title: 'Direct over fair-trade-only', body: 'We pay 30-40% above C-market price, directly to farmers. Better than any certification.' },
            { title: 'Fresh over old', body: 'Coffee tastes its best 5-30 days after roasting. We ship within 48hr of pulling beans from the roaster.' },
            { title: 'Honest over hype', body: 'We tell you exactly where the beans came from, who grew them, and how they were processed.' },
          ].map((b) => (
            <div key={b.title} className="p-6 border border-bone-200/8 bg-ink-700">
              <h3 className="font-serif text-xl text-ember mb-2">{b.title}</h3>
              <p className="text-sm text-bone-200/65 leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>

        <p className="font-serif italic text-ember text-xl">
          — Marcus &amp; Elena, founders
        </p>
      </div>
    </div>
  );
}
