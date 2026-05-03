'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from './types';
import { SUBSCRIPTION_DISCOUNT } from './utils';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string, isSubscription: boolean) => void;
  updateQuantity: (variantId: string, isSubscription: boolean, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const items = get().items;
        // Match on both variantId AND subscription flag (sub & one-time are separate lines)
        const existingIdx = items.findIndex(
          (i) => i.variantId === newItem.variantId && i.isSubscription === newItem.isSubscription
        );

        if (existingIdx >= 0) {
          const updated = [...items];
          updated[existingIdx].quantity += newItem.quantity;
          set({ items: updated, isOpen: true });
        } else {
          set({ items: [...items, newItem], isOpen: true });
        }
      },

      removeItem: (variantId, isSubscription) => {
        set({
          items: get().items.filter(
            (i) => !(i.variantId === variantId && i.isSubscription === isSubscription)
          ),
        });
      },

      updateQuantity: (variantId, isSubscription, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId, isSubscription);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId && i.isSubscription === isSubscription
              ? { ...i, quantity }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const price = item.isSubscription
            ? item.unitPricePence * (1 - SUBSCRIPTION_DISCOUNT)
            : item.unitPricePence;
          return sum + price * item.quantity;
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'brenn-cart',
      partialize: (state) => ({ items: state.items }), // don't persist isOpen
    }
  )
);
