import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format pence (e.g. 1900) as £19.00 */
export function formatPrice(pence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pence / 100);
}

/** Convert £19.00 string to pence (1900) */
export function parsePrice(input: string): number {
  return Math.round(parseFloat(input.replace(/[^0-9.]/g, '')) * 100);
}

/** Roast level (1-5) → text label */
export function roastLabel(level: number): string {
  return ['Light', 'Light-medium', 'Medium', 'Medium-dark', 'Dark'][level - 1] ?? 'Medium';
}

/** Slugify a string for URLs — handles Unicode diacritics (Café → cafe) */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Calculate shipping (free over £30) */
export function calculateShipping(subtotalPence: number): number {
  if (subtotalPence >= 3000) return 0;
  return 395; // £3.95
}

/** 15% subscription discount */
export const SUBSCRIPTION_DISCOUNT = 0.15;
