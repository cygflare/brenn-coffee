'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import type { Product } from '@/lib/types';

type Action = (
  prev: { error?: string },
  formData: FormData
) => Promise<{ error?: string }>;

export function ProductForm({
  action,
  product,
  submitLabel,
}: {
  action: Action;
  product?: Partial<Product>;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">
      <Section title="Essentials">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Name" name="name" required defaultValue={product?.name ?? ''} />
          <Field
            label="Slug"
            name="slug"
            defaultValue={product?.slug ?? ''}
            hint="Auto-generated from name if blank."
          />
          <Field label="Origin" name="origin" required defaultValue={product?.origin ?? ''} hint="e.g. Antigua, Guatemala" />
          <Field label="Country" name="country" defaultValue={product?.country ?? ''} hint="e.g. Guatemala" />
        </div>
        <Field label="Tagline" name="tagline" defaultValue={product?.tagline ?? ''} />
        <TextareaField label="Description" name="description" rows={5} defaultValue={product?.description ?? ''} />
      </Section>

      <Section title="Pricing & inventory">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Field
            label="Price (£) — for 250g"
            name="price_gbp"
            type="number"
            step="0.01"
            required
            defaultValue={product?.price_pence != null ? (product.price_pence / 100).toFixed(2) : ''}
            hint={product ? 'Editing this does not auto-update existing variant prices.' : 'Variants will be auto-created.'}
          />
          <Field
            label="Inventory (kg)"
            name="inventory_kg"
            type="number"
            step="0.01"
            defaultValue={product?.inventory_kg?.toString() ?? '0'}
          />
          <SelectField
            label="Roast level"
            name="roast_level"
            defaultValue={product?.roast_level?.toString() ?? '3'}
            options={[
              ['1', 'Light'],
              ['2', 'Light-medium'],
              ['3', 'Medium'],
              ['4', 'Medium-dark'],
              ['5', 'Dark'],
            ]}
          />
        </div>
        <div className="flex flex-wrap gap-6 pt-2">
          <Checkbox name="is_active" label="Active (visible on site)" defaultChecked={product?.is_active ?? true} />
          <Checkbox name="is_featured" label="Featured on homepage" defaultChecked={product?.is_featured ?? false} />
          <Checkbox name="is_limited" label="Limited edition" defaultChecked={product?.is_limited ?? false} />
        </div>
      </Section>

      <Section title="Origin details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Process" name="process" defaultValue={product?.process ?? ''} hint='e.g. "Washed", "Natural"' />
          <Field
            label="Altitude (m)"
            name="altitude_m"
            type="number"
            defaultValue={product?.altitude_m?.toString() ?? ''}
          />
          <Field label="Variety" name="variety" defaultValue={product?.variety ?? ''} hint='e.g. "Bourbon, Caturra"' />
          <Field
            label="Cupping score"
            name="cupping_score"
            type="number"
            step="0.1"
            defaultValue={product?.cupping_score?.toString() ?? ''}
          />
          <Field label="Farm name" name="farm_name" defaultValue={product?.farm_name ?? ''} />
          <Field label="Farmer name" name="farmer_name" defaultValue={product?.farmer_name ?? ''} />
        </div>
        <Field
          label="Flavor notes (comma-separated)"
          name="flavor_notes"
          defaultValue={(product?.flavor_notes ?? []).join(', ')}
          hint='e.g. "dark chocolate, dried fig, cedar"'
        />
        <Field
          label="Hero image URL"
          name="hero_image_url"
          defaultValue={product?.hero_image_url ?? ''}
          hint="Paste a public image URL (Supabase Storage, Unsplash, etc.)"
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
  required,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  required?: boolean;
  defaultValue?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs tracking-[0.15em] uppercase text-bone-200/60 mb-2">{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        defaultValue={defaultValue}
        className="w-full bg-ink-700 border border-bone-200/15 px-3 py-2.5 text-bone-100 outline-none focus:border-ember transition-colors"
      />
      {hint && <span className="block text-xs text-bone-200/40 mt-1.5">{hint}</span>}
    </label>
  );
}

function TextareaField({
  label,
  name,
  rows = 4,
  defaultValue,
}: {
  label: string;
  name: string;
  rows?: number;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs tracking-[0.15em] uppercase text-bone-200/60 mb-2">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="w-full bg-ink-700 border border-bone-200/15 px-3 py-2.5 text-bone-100 outline-none focus:border-ember transition-colors resize-y"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: [string, string][];
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs tracking-[0.15em] uppercase text-bone-200/60 mb-2">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
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
