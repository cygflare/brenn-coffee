import Link from 'next/link';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const metadata = { title: 'Forgot password' };

export default function ForgotPasswordPage() {
  return (
    <div>
      <div className="eyebrow mb-4">Reset password</div>
      <h1 className="font-serif text-5xl text-bone-100 leading-[0.95] mb-6">
        Forgot your <em className="italic text-ember">password</em>?
      </h1>
      <p className="text-bone-200/65 mb-10 leading-relaxed">
        Enter your email and we'll send you a reset link.
      </p>

      <ForgotPasswordForm />

      <div className="mt-8 text-sm text-bone-200/60">
        <Link href="/sign-in" className="hover:text-ember">← Back to sign in</Link>
      </div>
    </div>
  );
}
