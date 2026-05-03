'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { Coupon } from '@/lib/types';

type Action = (
  prev: { error?: string },
  formData: FormData
) => Promise<{ error?: string }>;

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  // Format as yyyy-MM-ddTHH:mm in local time
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CouponForm({
  action,
  coupon,
  submitLabel,
}: {
  action: Action;
  coupon?: Partial<Coupon>;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {});
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount' | 'free_shipping'>(
    (coupon?.discount_type as any) ?? 'percentage'
  );

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">
      <Section title="Code">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Code"
            name="code"
            required
            defaultValue={coupon?.code ?? ''}
            hint="Letters, numbers, hyphens, underscores. Always uppercase."
            uppercase
          />
          <Field
            label="Internal description"
            name="description"
            defaultValue={coupon?.description ?? ''}
            hint="For your records — not shown publicly."
          />
        </div>
      </Section>

      <Section title="Discount">
        <SelectField
          label="Discount type"
          name="discount_type"
          value={discountType}
          onChange={(v) => setDiscountType(v as any)}
          options={[
            ['percentage', 'Percentage off'],
            ['fixed_amount', 'Fixed amount off'],
            ['free_shipping', 'Free shipping'],
          ]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {discountType === 'percentage' && (
            <>
              <Field
                label="Percent off (1–100)"
                name="discount_value_pct"
                type="number"
                step="1"
                min="1"
                max="100"
                required
                defaultValue={
                  coupon?.discount_type === 'percentage' && coupon.discount_value != null
                    ? String(coupon.discount_value)
                    : ''
                }
              />
              <Field
                label="Max discount (£) — optional cap"
                name="max_discount_gbp"
                type="number"
                step="0.01"
                min="0"
                defaultValue={
                  coupon?.max_discount_pence != null
                    ? (coupon.max_discount_pence / 100).toFixed(2)
                    : ''
                }
                hint="Leave blank for no cap."
              />
            </>
          )}
          {discountType === 'fixed_amount' && (
            <Field
              label="Amount off (£)"
              name="discount_value_gbp"
              type="number"
              step="0.01"
              min="0.01"
              required
              defaultValue={
                coupon?.discount_type === 'fixed_amount' && coupon.discount_value != null
                  ? (coupon.discount_value / 100).toFixed(2)
                  : ''
              }
            />
          )}
          {discountType === 'free_shipping' && (
            <p className="text-xs text-bone-200/55 sm:col-span-2">
              Customer pays no shipping fee. Subject to other rules below.
            </p>
          )}
        </div>
      </Section>

      <Section title="Eligibility">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Min order subtotal (£)"
            name="min_subtotal_gbp"
            type="number"
            step="0.01"
            min="0"
            defaultValue={
              coupon?.min_subtotal_pence != null
                ? (coupon.min_subtotal_pence / 100).toFixed(2)
                : '0.00'
            }
            hint="Cart subtotal must be at least this much."
          />
          <Field
            label="Total usage limit"
            name="usage_limit"
            type="number"
            step="1"
            min="0"
            defaultValue={coupon?.usage_limit?.toString() ?? ''}
            hint="Leave blank for unlimited."
          />
          <Field
            label="Per-customer limit"
            name="usage_limit_per_customer"
            type="number"
            step="1"
            min="0"
            defaultValue={coupon?.usage_limit_per_customer?.toString() ?? ''}
            hint="How many times each customer can use it. Blank = unlimited."
          />
          <div />
          <Field
            label="Starts at"
            name="starts_at"
            type="datetime-local"
            defaultValue={toLocalInput(coupon?.starts_at)}
            hint="Leave blank to start immediately."
          />
          <Field
            label="Expires at"
            name="expires_at"
            type="datetime-local"
            defaultValue={toLocalInput(coupon?.expires_at)}
            hint="Leave blank for no expiry."
          />
        </div>

        <div className="flex flex-wrap gap-6 pt-2">
          <Checkbox name="is_active" label="Active" defaultChecked={coupon?.is_active ?? true} />
          <Checkbox
            name="first_order_only"
            label="First-time customers only"
            defaultChecked={coupon?.first_order_only ?? false}
          />
          <Checkbox
            name="applies_to_one_time"
            label="Applies to one-time purchases"
            defaultChecked={coupon?.applies_to_one_time ?? true}
          />
          <Checkbox
            name="applies_to_subscription"
            label="Applies to subscriptions"
            defaultChecked={coupon?.applies_to_subscription ?? true}
          />
        </div>

        <Field
          label="Restrict to product IDs (comma-separated)"
          name="product_ids"
          defaultValue={(coupon?.product_ids ?? []).join(', ')}
          hint="Leave blank to apply to all products. Use IDs from /admin/products."
        />
      </Section>

      {state.error && (
        <div className="text-sm text-ember bg-ember/5 border border-ember/20 px-3 py-2">
          {state.error}
        </div>
      )}

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-5">
      <legend className="text-xs tracking-[0.2em] uppercase text-ember mb-2">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  name,
  type = 'text',
  step,
  min,
  max,
  required,
  defaultValue,
  hint,
  uppercase,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  min?: string;
  max?: string;
  required?: boolean;
  defaultValue?: string;
  hint?: string;
  uppercase?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs tracking-[0.15em] uppercase text-bone-200/60 mb-2">{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        min={min}
        max={max}
        required={required}
        defaultValue={defaultValue}
        className={`w-full bg-ink-700 border border-bone-200/15 px-3 py-2.5 text-bone-100 outline-none focus:border-ember transition-colors ${uppercase ? 'uppercase tracking-wider' : ''}`}
      />
      {hint && <span className="block text-xs text-bone-200/40 mt-1.5">{hint}</span>}
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: [string, string][];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs tracking-[0.15em] uppercase text-bone-200/60 mb-2">{label}</span>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-ink-700 border border-bone-200/15 px-3 py-2.5 text-bone-100 outline-none focus:border-ember"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-bone-200/85 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="w-4 h-4 accent-ember"
      />
      {label}
    </label>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending && <Loader2 className="animate-spin" size={16} />}
      {pending ? 'Saving…' : children}
    </button>
  );
}
