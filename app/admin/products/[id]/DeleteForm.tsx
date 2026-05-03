'use client';

import { Trash2 } from 'lucide-react';
import { deleteProductAction } from '../actions';

export function DeleteForm({ id, name }: { id: string; name: string }) {
  return (
    <form action={deleteProductAction.bind(null, id)}>
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm(`Delete "${name}"? This cannot be undone.`)) e.preventDefault();
        }}
        className="text-xs tracking-[0.15em] uppercase text-bone-200/40 hover:text-red-400 inline-flex items-center gap-1.5 transition-colors"
      >
        <Trash2 size={12} />
        Delete
      </button>
    </form>
  );
}
