import Link from 'next/link';
import { SignInForm } from './SignInForm';

export const metadata = { title: 'Sign in' };

export default function SignInPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <div>
      <div className="eyebrow mb-4">Welcome back</div>
      <h1 className="font-serif text-5xl text-bone-100 leading-[0.95] mb-10">
        Sign <em className="italic text-ember">in</em>.
      </h1>

      <SignInForm next={searchParams.next} initialError={searchParams.error} />

      <div className="mt-8 text-sm text-bone-200/60 space-y-2">
        <p>
          New here?{' '}
          <Link
            href={`/sign-up${searchParams.next ? `?next=${encodeURIComponent(searchParams.next)}` : ''}`}
            className="text-ember hover:text-ember-400"
          >
            Create an account →
          </Link>
        </p>
        <p>
          <Link href="/forgot-password" className="text-bone-200/60 hover:text-ember">
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
}
