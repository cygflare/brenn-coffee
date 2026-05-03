'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, Save, X, Loader2, Pencil } from 'lucide-react';
import { GRIND_LABELS } from '@/lib/types';
import {
  createVariantAction,
  updateVariantAction,
  deleteVariantAction,
} from '../actions';

type Variant = {
  id: string;
  size_g: number;
  grind: string;
  price_pence: number;
  sku: string | null;
  is_active: boolean;
};

const GRIND_OPTIONS: [string, string][] = [
  ['whole_bean', GRIND_LABELS.whole_bean],
  ['espresso', GRIND_LABELS.espresso],
  ['filter', GRIND_LABELS.filter],
  ['french_press', GRIND_LABELS.french_press],
  ['moka_pot', GRIND_LABELS.moka_pot],
];

const SIZE_OPTIONS: [number, string][] = [
  [125, '125g'],
  [250, '250g'],
  [500, '500g'],
  [1000, '1kg'],
];

export function VariantsEditor({
  productId,
  variants,
}: {
  productId: string;
  variants: Variant[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const sorted = [...variants].sort((a, b) => {
    if (a.size_g !== b.size_g) return a.size_g - b.size_g;
    return a.grind.localeCompare(b.grind);
  });

  return (
    <section className="mt-10 pt-6 border-t border-bone-200/10">
      <header className="flex items-end justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-2xl text-bone-100 mb-1">Variants</h2>
          <p className="text-xs text-bone-200/55">
            {variants.length} variant{variants.length === 1 ? '' : 's'}. Edit prices, toggle availability, or add new sizes/grinds.
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-xs tracking-[0.15em] uppercase border border-bone-200/20 text-bone-100 hover:border-ember hover:text-ember px-4 py-2.5 inline-flex items-center gap-2 transition-colors"
          >
            <Plus size={12} />
            Add variant
          </button>
        )}
      </header>

      <div className="border border-bone-200/8">
        <div className="hidden md:grid grid-cols-[1.2fr_1fr_1fr_1fr_120px_140px] gap-4 bg-ink-700 px-4 py-3 text-xs tracking-[0.15em] uppercase text-bone-200/60">
          <div>SKU</div>
          <div>Size</div>
          <div>Grind</div>
          <div className="text-right">Price</div>
          <div className="text-center">Active</div>
          <div className="text-right">Actions</div>
        </div>

        {adding && (
          <VariantRow
            mode="create"
            productId={productId}
            onDone={() => setAdding(false)}
            onCancel={() => setAdding(false)}
          />
        )}

        {sorted.map((v) =>
          editingId === v.id ? (
            <VariantRow
              key={v.id}
              mode="edit"
              productId={productId}
              variant={v}
              onDone={() => setEditingId(null)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <ReadRow
              key={v.id}
              productId={productId}
              variant={v}
              onEdit={() => setEditingId(v.id)}
            />
          )
        )}

        {variants.length === 0 && !adding && (
          <div className="px-4 py-8 text-center text-sm text-bone-200/55">
            No variants yet. Click "Add variant" to create one.
          </div>
        )}
      </div>
    </section>
  );
}

function ReadRow({
  productId,
  variant,
  onEdit,
}: {
  productId: string;
  variant: Variant;
  onEdit: () => void;
}) {
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete variant ${variant.size_g}g · ${variant.grind.replace('_', ' ')}? This cannot be undone.`))
      return;
    startTransition(() => {
      deleteVariantAction(variant.id, productId);
    });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-[1.2fr_1fr_1fr_1fr_120px_140px] gap-x-4 gap-y-2 px-4 py-3 border-t border-bone-200/8 bg-ink-700/40 text-sm items-center">
      <div className="md:col-span-1 col-span-2 text-bone-200/70 font-mono text-xs">
        {variant.sku ?? <span className="text-bone-200/35">—</span>}
      </div>
      <div className="text-bone-100">{variant.size_g}g</div>
      <div className="text-bone-200/75 capitalize">{variant.grind.replace('_', ' ')}</div>
      <div className="md:text-right text-bone-100 tabular-nums font-medium">
        £{(variant.price_pence / 100).toFixed(2)}
      </div>
      <div className="md:text-center">
        {variant.is_active ? (
          <span className="text-green-400">✓</span>
        ) : (
          <span className="text-bone-200/40">—</span>
        )}
      </div>
      <div className="md:text-right col-span-2 md:col-span-1 flex md:justify-end gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="text-xs tracking-[0.15em] uppercase text-bone-200/65 hover:text-ember inline-flex items-center gap-1.5"
        >
          <Pencil size={11} />
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="text-xs tracking-[0.15em] uppercase text-bone-200/40 hover:text-red-400 inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          {pending ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
          Delete
        </button>
      </div>
    </div>
  );
}

function VariantRow({
  mode,
  productId,
  variant,
  onDone,
  onCancel,
}: {
  mode: 'create' | 'edit';
  productId: string;
  variant?: Variant;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [size_g, setSize] = useState<number>(variant?.size_g ?? 250);
  const [grind, setGrind] = useState<string>(variant?.grind ?? 'whole_bean');
  const [priceGbp, setPriceGbp] = useState<string>(
    variant ? (variant.price_pence / 100).toFixed(2) : ''
  );
  const [sku, setSku] = useState<string>(variant?.sku ?? '');
  const [isActive, setIsActive] = useState<boolean>(variant?.is_active ?? true);

  const submit = () => {
    setError(null);
    const fd = new FormData();
    fd.set('size_g', String(size_g));
    fd.set('grind', grind);
    fd.set('price_gbp', priceGbp);
    fd.set('sku', sku);
    if (isActive) fd.set('is_active', 'on');

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createVariantAction(productId, {}, fd)
          : await updateVariantAction(variant!.id, productId, {}, fd);

      if (result?.error) {
        setError(result.error);
      } else {
        onDone();
      }
    });
  };

  return (
    <div className="border-t border-bone-200/8 bg-ember/5">
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr_1fr_120px_140px] gap-3 px-4 py-3 items-center">
        <input
          type="text"
          placeholder="SKU (auto if blank)"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          className="bg-ink-800 border border-bone-200/15 px-2.5 py-2 text-bone-100 outline-none focus:border-ember font-mono text-xs"
        />
        <select
          value={size_g}
          onChange={(e) => setSize(Number(e.target.value))}
          className="bg-ink-800 border border-bone-200/15 px-2.5 py-2 text-bone-100 outline-none focus:border-ember text-sm"
        >
          {SIZE_OPTIONS.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={grind}
          onChange={(e) => setGrind(e.target.value)}
          className="bg-ink-800 border border-bone-200/15 px-2.5 py-2 text-bone-100 outline-none focus:border-ember text-sm"
        >
          {GRIND_OPTIONS.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <div className="md:text-right">
          <div className="inline-flex items-center bg-ink-800 border border-bone-200/15 focus-within:border-ember">
            <span className="px-2 text-bone-200/55 text-sm">£</span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={priceGbp}
              onChange={(e) => setPriceGbp(e.target.value)}
              className="bg-transparent w-24 py-2 pr-2 text-bone-100 outline-none text-sm tabular-nums"
            />
          </div>
        </div>
        <div className="md:text-center">
          <label className="inline-flex items-center gap-2 text-xs text-bone-200/85 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-ember"
            />
            Active
          </label>
        </div>
        <div className="md:text-right flex md:justify-end gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="text-xs tracking-[0.15em] uppercase text-ember inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            {pending ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
            {mode === 'create' ? 'Add' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="text-xs tracking-[0.15em] uppercase text-bone-200/55 hover:text-bone-100 inline-flex items-center gap-1.5"
          >
            <X size={11} />
            Cancel
          </button>
        </div>
      </div>
      {error && (
        <div className="px-4 pb-3 text-xs text-red-400">{error}</div>
      )}
    </div>
  );
}
