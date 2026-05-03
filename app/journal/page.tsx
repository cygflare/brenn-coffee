import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'Stories from the roastery — origin trips, brewing experiments, and notes from behind the Probat.',
  alternates: { canonical: '/journal' },
  openGraph: {
    title: 'Journal · Brenn Coffee',
    description: 'Stories from the roastery — origin, brewing, and craft.',
    url: '/journal',
    type: 'website',
  },
};

export default function JournalPage() {
  return (
    <div className="container-x py-16 lg:py-24">
      <div className="max-w-3xl mb-16">
        <div className="eyebrow mb-4">Stories from the roastery</div>
        <h1 className="font-serif text-5xl lg:text-7xl text-bone-100 leading-[0.95] mb-6">
          The <em className="italic text-ember">journal</em>.
        </h1>
        <p className="text-lg text-bone-200/70 leading-relaxed">
          Field notes from origin trips, roasting experiments, and the people behind
          the beans.
        </p>
      </div>

      <div className="text-center py-20 border border-bone-200/8 bg-ink-700">
        <div className="font-serif text-3xl text-bone-100 mb-3">
          <em className="italic">Coming soon.</em>
        </div>
        <p className="text-bone-200/55 max-w-md mx-auto">
          We're working on our first set of stories — including a recent trip to
          Yirgacheffe with our Ethiopian co-op partners.
        </p>
      </div>
    </div>
  );
}
