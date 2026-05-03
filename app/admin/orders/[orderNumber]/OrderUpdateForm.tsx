'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { updateOrderAction, type OrderUpdateResult } from '../actions';

export function OrderUpdateForm({
  orderNumber,
  currentStatus,
  currentTrackingNumber,
  currentTrackingUrl,
}: {
  orderNumber: string;
  currentStatus: string;
  currentTrackingNumber: string;
  currentTrackingUrl: string;
}) {
  const action = updateOrderAction.bind(null, orderNumber);
  const [state, formAction] = useFormState<OrderUpdateResult, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4 bg-ink-700 border border-bone-200/8 p-5">
      <label className="block">
        <span className="block text-xs tracking-[0.15em] uppercase text-bone-200/60 mb-2">Status</span>
        <select
          name="status"
          defaultValue={currentStatus}
          className="w-full bg-ink-900 border border-bone-200/15 px-3 py-2 text-bone-100 outline-none focus:border-ember"
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="refunded">Refunded</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>

      <label className="block">
        <span className="block text-xs tracking-[0.15em] uppercase text-bone-200/60 mb-2">Tracking number</span>
        <input
          name="tracking_number"
          defaultValue={currentTrackingNumber}
          placeholder="e.g. RM123456789GB"
          className="w-full bg-ink-900 border border-bone-200/15 px-3 py-2 text-bone-100 outline-none focus:border-ember"
        />
      </label>

      <label className="block">
        <span className="block text-xs tracking-[0.15em] uppercase text-bone-200/60 mb-2">Tracking URL</span>
        <input
          name="tracking_url"
          type="url"
          defaultValue={currentTrackingUrl}
          placeholder="https://royalmail.com/track/..."
          className="w-full bg-ink-900 border border-bone-200/15 px-3 py-2 text-bone-100 outline-none focus:border-ember"
        />
      </label>

      {state.error && (
        <div className="text-xs text-ember bg-ember/5 border border-ember/20 px-3 py-2">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="text-xs text-green-300 bg-green-500/5 border border-green-500/20 px-3 py-2">
          {state.success}
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
      className="w-full btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-60"
    >
      {pending && <Loader2 className="animate-spin" size={14} />}
      {pending ? 'Saving…' : 'Save changes'}
    </button>
  );
}
