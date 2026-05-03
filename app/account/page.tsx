import Link from 'next/link';

export const metadata = { title: 'Account — Brenn Coffee' };

export default function AccountPage() {
  return (
    <div className="container-x py-16 lg:py-24 max-w-2xl">
      <div className="eyebrow mb-4">Your account</div>
      <h1 className="font-serif text-5xl lg:text-6xl text-bone-100 leading-[0.95] mb-8">
        Sign <em className="italic text-ember">in</em>.
      </h1>

      <div className="bg-ink-700 border border-bone-200/8 p-8 lg:p-10 text-center">
        <p className="font-serif italic text-2xl text-bone-100 mb-3">
          Customer accounts coming soon.
        </p>
        <p className="text-bone-200/60 mb-8 leading-relaxed">
          We're building a full account experience with order history, saved addresses,
          and subscription management. For now, you can check out as a guest — order
          confirmations are sent to your email.
        </p>
        <Link href="/shop" className="btn-primary">
          Browse coffee →
        </Link>
      </div>
    </div>
  );
}
