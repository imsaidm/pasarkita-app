import 'server-only';
import { findOrderById, listStoreOrders } from '@pasarkita/db';
import { resolveTenantId } from '@/lib/tenant/resolve';

/**
 * Lapisan data pesanan. Tanda tangan dipertahankan persis seperti versi
 * sebelumnya supaya halaman tidak perlu diedit; isinya sekarang PostgreSQL.
 */

export { ORDER_STATUS_LABEL, type OrderStatus } from './order-status';
import type { OrderStatus } from './order-status';

export interface OrderItem {
  productId: string;
  name: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingLabel: string;
  paymentLabel: string;
  recipientName: string;
  address: string;
}

type DbOrder = Awaited<ReturnType<typeof listStoreOrders>>[number];

function toOrder(o: DbOrder): Order {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    createdAt: o.createdAt,
    items: o.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      ...(i.variantLabel ? { variantLabel: i.variantLabel } : {}),
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      imageUrl: i.imageUrl,
    })),
    subtotal: o.subtotal,
    shippingCost: o.shippingCost,
    total: o.total,
    shippingLabel: o.shippingLabel,
    paymentLabel: o.paymentLabel,
    recipientName: o.recipientName,
    address: o.address,
  };
}

/**
 * Catatan penting: ini mengembalikan pesanan milik TOKO, bukan milik satu
 * pembeli. Belum ada identitas pembeli di skema, jadi halaman yang
 * memakainya hanya boleh dibuka pemilik toko — bukan dipasang di halaman
 * akun publik.
 */
export async function getAllOrders(): Promise<Order[]> {
  return (await listStoreOrders(await resolveTenantId())).map(toOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const found = await findOrderById(await resolveTenantId(), id);
  return found === null ? null : toOrder(found);
}
