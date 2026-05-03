'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signInAction, type AuthResult } from '../actions';
import { Loader2 } from 'lucide-react';

export function SignInForm({ next, initialError }: { next?: string; initialError?: string }) {
  const [state, formAction] = useFormState<AuthResult, FormData>(signInAction, {
    error: initialError === 'auth_callback_failed' ? 'Sign-in link expired or invalid.' : undefined,
  });

  return (
    <form action={formAction} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}

      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required />

      {state.error && (
        <div className="text-sm text-ember bg-ember/5 border border-ember/20 px-3 py-2">
          {state.error}
        </div>
      )}

      <SubmitButton>Sign in</SubmitButton>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs tracking-[0.15em] uppercase text-bone-200/60 mb-2">
        {label}
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        className="w-full bg-ink-700 border border-bone-200/15 px-4 py-3 text-bone-100 placeholder:text-bone-200/30 outline-none focus:border-ember transition-colors"
      />
    </label>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending && <Loader2 className="animate-spin" size={16} />}
      {pending ? 'Working…' : children}
    </button>
  );
}
