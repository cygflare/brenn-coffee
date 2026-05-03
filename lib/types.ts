// ============================================================================
// BRENN — TYPE DEFINITIONS
// These match the Supabase database schema in /supabase/schema.sql
// ============================================================================

export type GrindType =
  | 'whole_bean'
  | 'espresso'
  | 'filter'
  | 'french_press'
  | 'moka_pot';

export const GRIND_LABELS: Record<GrindType, string> = {
  whole_bean: 'Whole bean',
  espresso: 'Espresso',
  filter: 'Filter',
  french_press: 'French press',
  moka_pot: 'Moka pot',
};

export type SizeGrams = 125 | 250 | 500 | 1000;

export const SIZE_LABELS: Record<SizeGrams, string> = {
  125: '125g',
  250: '250g',
  500: '500g',
  1000: '1kg',
};

export interface Product {
  id: string;
  slug: string;
  name: string;
  origin: string;
  country: string | null;
  tagline: string | null;
  description: string | null;
  roast_level: number; // 1-5
  process: string | null;
  altitude_m: number | null;
  variety: string | null;
  cupping_score: number | null;
  flavor_notes: string[];
  flavor_categories: Record<string, boolean>;
  body: number | null;
  acidity: number | null;
  sweetness: number | null;
  bitterness: number | null;
  aroma: number | null;
  brewing_recs: BrewRec[];
  farm_name: string | null;
  farmer_name: string | null;
  hero_image_url: string | null;
  gallery_images: string[];
  price_pence: number;
  is_active: boolean;
  is_featured: boolean;
  is_limited: boolean;
  inventory_kg: number;
  reorder_threshold_kg: number;
  created_at: string;
  updated_at: string;
}

export interface BrewRec {
  method: 'espresso' | 'pour_over' | 'french_press' | 'cold_brew' | 'moka';
  rating: 'best' | 'great' | 'good';
  ratio: string;
  time: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size_g: SizeGrams;
  grind: GrindType;
  price_pence: number;
  sku: string;
  is_active: boolean;
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

export interface CartItem {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  size_g: SizeGrams;
  grind: GrindType;
  unitPricePence: number;
  quantity: number;
  isSubscription: boolean;
}

export type CouponDiscountType = 'percentage' | 'fixed_amount' | 'free_shipping';

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: CouponDiscountType;
  discount_value: number;
  min_subtotal_pence: number;
  max_discount_pence: number | null;
  usage_limit: number | null;
  usage_limit_per_customer: number | null;
  times_used: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  first_order_only: boolean;
  applies_to_subscription: boolean;
  applies_to_one_time: boolean;
  product_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface AppliedCoupon {
  code: string;
  description: string | null;
  discount_type: CouponDiscountType;
  discount_pence: number;
  free_shipping: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  email: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded' | 'cancelled';
  subtotal_pence: number;
  shipping_pence: number;
  discount_pence: number;
  total_pence: number;
  currency: string;
  shipping_name: string | null;
  shipping_line1: string | null;
  shipping_line2: string | null;
  shipping_city: string | null;
  shipping_postcode: string | null;
  shipping_country: string;
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
}
