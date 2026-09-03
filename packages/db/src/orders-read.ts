import { DbError, query, queryOne, transaction } from './client';

/**
 * Pembacaan dan penulisan pesanan toko online.
 *
 * Status pembayaran dan tahap pengiriman sengaja dua kolom terpisah:
 * `status` berbicara soal uang, `fulfillment` soal barang. Menggabungkannya
 * akan mengubah arti setiap laporan kas yang membaca `status`.
 */

export type OrderStatus = 'diproses' | 'dikirim' | 'selesai' | 'dibatalkan';

export type OrderItemRead = {
  readonly productId: string;
  readonly name: string;
  readonly variantLabel?: string;
  readonly unitPrice: number;
  readonly quantity: number;
  readonly imageUrl: string | null;
};

export type OrderRead = {
  readonly id: string;
  readonly orderNumber: string;
  readonly status: OrderStatus;
  readonly createdAt: string;
  readonly items: readonly OrderItemRead[];
  readonly subtotal: number;
  readonly shippingCost: number;
  readonly total: number;
  readonly shippingLabel: string;
  readonly paymentLabel: string;
  readonly recipientName: string;
  readonly address: string;
};

/** Nomor pesanan diturunkan dari id, bukan disimpan. Satu kunci unik cukup. */
function orderNumberOf(id: string): string {
  return `PK-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

const DATE_FORMAT = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/**
 * Menerjemahkan dua kolom menjadi satu label yang dimengerti pembeli.
 * Pembeli tidak peduli soal pemisahan uang dan barang — dia cuma mau tahu
 * pesanannya sampai mana.
 */
function statusOf(status: string, fulfillment: string): OrderStatus {
  if (status === 'cancelled') return 'dibatalkan';
  if (status === 'returned') return 'dibatalkan';
  if (fulfillment === 'delivered') return 'selesai';
  if (fulfillment === 'shipped') return 'dikirim';
  return 'diproses';
}

type OrderRow = {
  id: string;
  status: string;
  fulfillment: string;
  created_at: string;
  total_cents: string;
  shipping_cents: string;
  shipping_label: string | null;
  payment_method: string | null;
  recipient_name: string | null;
  address: string | null;
};

type LineRow = {
  order_id: string;
  product_id: string;
  name: string;
  variant_name: string | null;
  unit_price_cents: string;
  qty: number;
};

const PAYMENT_LABELS: Readonly<Record<string, string>> = Object.freeze({
  cash: 'Tunai',
  qris: 'QRIS',
  card: 'Kartu',
  transfer: 'Transfer Bank',
});

async function attachLines(rows: readonly OrderRow[]): Promise<OrderRead[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const lines = await query<LineRow>(
    `SELECT ol.order_id, p.id AS product_id, p.name,
            nullif(v.name, 'Standar') AS variant_name,
            ol.unit_price_cents::text, ol.qty
     FROM order_line ol
     JOIN sku s     ON s.id = ol.sku_id
     JOIN variant v ON v.id = s.variant_id
     JOIN product p ON p.id = v.product_id
     WHERE ol.order_id = ANY($1)`,
    [ids],
  );

  const byOrder = new Map<string, OrderItemRead[]>();
  for (const line of lines) {
    const list = byOrder.get(line.order_id) ?? [];
    list.push({
      productId: line.product_id,
      name: line.name,
      ...(line.variant_name ? { variantLabel: line.variant_name } : {}),
      unitPrice: Math.round(Number(line.unit_price_cents) / 100),
      quantity: line.qty,
      imageUrl: null,
    });
    byOrder.set(line.order_id, list);
  }

  return rows.map((row) => {
    const items = byOrder.get(row.id) ?? [];
    const total = Math.round(Number(row.total_cents) / 100);
    const shipping = Math.round(Number(row.shipping_cents ?? 0) / 100);
    return Object.freeze({
      id: row.id,
      orderNumber: orderNumberOf(row.id),
      status: statusOf(row.status, row.fulfillment),
      createdAt: DATE_FORMAT.format(new Date(row.created_at)),
      items,
      subtotal: Math.max(0, total - shipping),
      shippingCost: shipping,
      total,
      shippingLabel: row.shipping_label ?? 'Belum ditentukan',
      paymentLabel: PAYMENT_LABELS[row.payment_method ?? ''] ?? 'Belum ditentukan',
      recipientName: row.recipient_name ?? '',
      address: row.address ?? '',
    });
  });
}

const ORDER_COLUMNS = `
  o.id, o.status, o.fulfillment, o.created_at::text,
  o.total_cents::text, o.shipping_cents::text, o.shipping_label,
  o.payment_method, o.recipient_name, o.address
`;

export async function listStoreOrders(
  tenantId: string,
  limit = 50,
): Promise<readonly OrderRead[]> {
  const rows = await query<OrderRow>(
    `SELECT ${ORDER_COLUMNS} FROM "order" o
     WHERE o.tenant_id = $1 AND o.channel = 'store'
     ORDER BY o.created_at DESC LIMIT $2`,
    [tenantId, Math.max(1, Math.min(limit, 200))],
  );
  return attachLines(rows);
}

export async function findOrderById(
  tenantId: string,
  orderId: string,
): Promise<OrderRead | null> {
  const row = await queryOne<OrderRow>(
    `SELECT ${ORDER_COLUMNS} FROM "order" o WHERE o.tenant_id = $1 AND o.id = $2`,
    [tenantId, orderId],
  );
  if (row === null) return null;
  return (await attachLines([row]))[0] ?? null;
}

export type StoreOrderInput = {
  readonly orderId: string;
  readonly idempotencyKey: string;
  readonly outletId: string;
  readonly lines: readonly { skuId: string; qty: number }[];
  readonly recipientName: string;
  readonly recipientPhone: string;
  readonly address: string;
  readonly shippingLabel: string;
  readonly shippingCents: number;
  readonly paymentMethod: 'transfer' | 'qris';
};

/**
 * Mencatat pesanan dari toko online.
 *
 * Sama seperti kasir: harga diambil dari basis data, tidak pernah dari
 * keranjang di sisi pembeli. Stok berkurang lewat baris buku besar, dan
 * kas bertambah dalam transaksi yang sama.
 */
export async function recordStoreOrder(
  tenantId: string,
  input: StoreOrderInput,
): Promise<{ orderId: string; totalCents: number; duplicate: boolean }> {
  if (input.lines.length === 0) throw new DbError('Keranjang kosong.');
  if (input.lines.some((l) => l.qty <= 0)) throw new DbError('Jumlah barang tidak sah.');

  const existing = await queryOne<{ id: string; total_cents: string }>(
    `SELECT id, total_cents::text FROM "order" WHERE tenant_id = $1 AND idempotency_key = $2`,
    [tenantId, input.idempotencyKey],
  );
  if (existing !== null) {
    return { orderId: existing.id, totalCents: Number(existing.total_cents), duplicate: true };
  }

  return transaction(async (client) => {
    const skuIds = input.lines.map((l) => l.skuId);
    const priced = await client.query<{ id: string; price_cents: string }>(
      'SELECT id, price_cents::text FROM sku WHERE tenant_id = $1 AND id = ANY($2)',
      [tenantId, skuIds],
    );
    const priceOf = new Map(priced.rows.map((r) => [r.id, Number(r.price_cents)]));
    const missing = skuIds.filter((id) => !priceOf.has(id));
    if (missing.length > 0) throw new DbError('Ada barang yang sudah tidak tersedia.');

    let goodsCents = 0;
    for (const line of input.lines) goodsCents += (priceOf.get(line.skuId) ?? 0) * line.qty;
    const totalCents = goodsCents + input.shippingCents;

    await client.query(
      `INSERT INTO "order"
         (id, tenant_id, channel, outlet_id, status, fulfillment, total_cents,
          idempotency_key, payment_method, recipient_name, recipient_phone,
          address, shipping_label, shipping_cents)
       VALUES ($1, $2, 'store', $3, 'paid', 'packing', $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        input.orderId, tenantId, input.outletId, totalCents, input.idempotencyKey,
        input.paymentMethod, input.recipientName, input.recipientPhone,
        input.address, input.shippingLabel, input.shippingCents,
      ],
    );

    let i = 0;
    for (const line of input.lines) {
      i += 1;
      await client.query(
        `INSERT INTO order_line (id, order_id, sku_id, qty, unit_price_cents)
         VALUES ($1, $2, $3, $4, $5)`,
        [`${input.orderId}_l${i}`, input.orderId, line.skuId, line.qty, priceOf.get(line.skuId) ?? 0],
      );
      await client.query(
        `INSERT INTO stock_ledger (tenant_id, sku_id, outlet_id, delta, reason, ref_type, ref_id)
         VALUES ($1, $2, $3, $4, 'sale', 'order', $5)`,
        [tenantId, line.skuId, input.outletId, -line.qty, input.orderId],
      );
    }

    await client.query(
      `INSERT INTO cash_entry (tenant_id, direction, amount_cents, reason, ref_type, ref_id)
       VALUES ($1, 'in', $2, 'Penjualan toko online', 'order', $3)`,
      [tenantId, totalCents, input.orderId],
    );

    return { orderId: input.orderId, totalCents, duplicate: false };
  });
}
