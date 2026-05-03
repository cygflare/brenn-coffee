'use server';

import { adminDb, requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export type OrderUpdateResult = { error?: string; success?: string };

export async function updateOrderAction(
  orderNumber: string,
  _prev: OrderUpdateResult,
  formData: FormData
): Promise<OrderUpdateResult> {
  await requireAdmin();
  const db = adminDb();

  const status = String(formData.get('status') ?? '').trim();
  const trackingNumber = String(formData.get('tracking_number') ?? '').trim() || null;
  const trackingUrl = String(formData.get('tracking_url') ?? '').trim() || null;

  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'refunded', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return { error: 'Invalid status.' };
  }

  const update: Record<string, any> = {
    status,
    tracking_number: trackingNumber,
    tracking_url: trackingUrl,
  };

  // Stamp timestamps when status transitions
  if (status === 'shipped') update.shipped_at = new Date().toISOString();
  if (status === 'delivered') update.delivered_at = new Date().toISOString();

  const { error } = await db.from('orders').update(update).eq('order_number', orderNumber);
  if (error) return { error: error.message };

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath('/account/orders');
  return { success: 'Order updated.' };
}
