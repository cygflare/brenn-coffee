'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { forgotPasswordAction, type AuthResult } from '../actions';
import { Loader2 } from 'lucide-react';

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState<AuthResult, FormData>(forgotPasswordAction, {});

  if (state.success) {
    return (
      <div className="bg-ink-700 border border-ember/30 p-6">
        <p className="text-bone-100 leading-relaxed">{state.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <label className="block">
        <span className="block text-xs tracking-[0.15em] uppercase text-bone-200/60 mb-2">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full bg-ink-700 border border-bone-200/15 px-4 py-3 text-bone-100 outline-none focus:border-ember transition-colors"
        />
      </label>

      {state.error && (
        <div className="text-sm text-ember bg-ember/5 border border-ember/20 px-3 py-2">
          {state.error}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
    >
      {pending && <Loader2 className="animate-spin" size={16} />}
      {pending ? 'Sending…' : 'Send reset link'}
    </button>
  );
}
