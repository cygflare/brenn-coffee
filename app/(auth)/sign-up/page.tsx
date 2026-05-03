import Link from 'next/link';
import { SignUpForm } from './SignUpForm';

export const metadata = { title: 'Create account' };

export default function SignUpPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <div>
      <div className="eyebrow mb-4">New to Brenn</div>
      <h1 className="font-serif text-5xl text-bone-100 leading-[0.95] mb-10">
        Create an <em className="italic text-ember">account</em>.
      </h1>

      <SignUpForm next={searchParams.next} />

      <div className="mt-8 text-sm text-bone-200/60">
        Already have one?{' '}
        <Link href="/sign-in" className="text-ember hover:text-ember-400">
          Sign in →
        </Link>
      </div>
    </div>
  );
}
