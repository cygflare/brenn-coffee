import { ResetPasswordForm } from './ResetPasswordForm';

export const metadata = { title: 'Reset password' };

export default function ResetPasswordPage() {
  return (
    <div>
      <div className="eyebrow mb-4">New password</div>
      <h1 className="font-serif text-5xl text-bone-100 leading-[0.95] mb-10">
        Choose a new <em className="italic text-ember">password</em>.
      </h1>

      <ResetPasswordForm />
    </div>
  );
}
