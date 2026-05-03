'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signUpAction, type AuthResult } from '../actions';
import { Loader2 } from 'lucide-react';

export function SignUpForm({ next }: { next?: string }) {
  const [state, formAction] = useFormState<AuthResult, FormData>(signUpAction, {});

  if (state.success) {
    return (
      <div className="bg-ink-700 border border-ember/30 p-8 text-center">
        <p className="font-serif italic text-2xl text-bone-100 mb-3">Check your inbox.</p>
        <p className="text-sm text-bone-200/65 leading-relaxed">{state.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}

      <Field label="First name" name="first_name" type="text" autoComplete="given-name" />
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="Minimum 8 characters."
      />

      {state.error && (
        <div className="text-sm text-ember bg-ember/5 border border-ember/20 px-3 py-2">
          {state.error}
        </div>
      )}

      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  required,
  hint,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
  hint?: string;
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
        className="w-full bg-ink-700 border border-bone-200/15 px-4 py-3 text-bone-100 placeholder:text-bone-200/30 outline-none focus:border-ember transition-colors"
      />
      {hint && <span className="block text-xs text-bone-200/40 mt-1.5">{hint}</span>}
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
