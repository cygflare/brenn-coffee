import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-x section-y-lg text-center">
      <div className="font-serif text-9xl text-ember/30 mb-4">404</div>
      <h1 className="font-serif text-5xl text-bone-100 mb-4">
        <em className="italic">Lost</em> the trail.
      </h1>
      <p className="text-bone-200/55 mb-10 max-w-md mx-auto">
        This page doesn't exist — or it's gone the way of yesterday's brew.
      </p>
      <Link href="/" className="btn-primary">
        Back to home →
      </Link>
    </div>
  );
}
