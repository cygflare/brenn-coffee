import Image from 'next/image';

export function StorySection() {
  return (
    <section className="container-x py-24 lg:py-32 border-t border-bone-200/8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="aspect-[4/5] bg-ink-600 border border-bone-200/8 relative overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=1000&q=85"
            alt="Roasted coffee beans, close-up"
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 text-[11px] tracking-[0.25em] uppercase text-ember/90">
            Est. MMXXVI
          </div>
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
