'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { resetPasswordAction, type AuthResult } from '../actions';
import { Loader2 } from 'lucide-react';

export function ResetPasswordForm() {
  const [state, formAction] = useFormState<AuthResult, FormData>(resetPasswordAction, {});

  return (
    <form action={formAction} className="space-y-5">
      <label className="block">
        <span className="block text-xs tracking-[0.15em] uppercase text-bone-200/60 mb-2">
          New password
        </span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full bg-ink-700 border border-bone-200/15 px-4 py-3 text-bone-100 outline-none focus:border-ember transition-colors"
        />
        <span className="block text-xs text-bone-200/40 mt-1.5">Minimum 8 characters.</span>
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
      {pending ? 'Saving…' : 'Save new password'}
    </button>
  );
}
