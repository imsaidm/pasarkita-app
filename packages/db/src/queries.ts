import { parsePlan, type Plan } from '@pasarkita/plan';
import { DbError, query, queryOne, transaction } from './client';

/**
 * Kueri yang dipakai ketiga aplikasi.
 *
 * Setiap fungsi menerima tenantId sebagai argumen pertama dan selalu
 * menyaring dengannya. Tidak ada kueri di sini yang bisa melihat lintas tenant.
 */

export type CatalogItem = {
  readonly skuId: string;
  readonly code: string;
  readonly name: string;
  readonly category: string | null;
  readonly priceCents: number;
  readonly unit: string;
  readonly stock: number;
};

export async function loadTenantPlan(tenantId: string): Promise<Plan | null> {
  const row = await queryOne<{ channel: string; tier: string }>(
    'SELECT channel, tier FROM tenant WHERE id = $1',
    [tenantId],
  );
  return row === null ? null : parsePlan(row.channel, row.tier);
}

export async function countSkus(tenantId: string): Promise<number> {
  const row = await queryOne<{ n: string }>(
    'SELECT count(*)::text AS n FROM sku WHERE tenant_id = $1',
    [tenantId],
  );
  return row === null ? 0 : Number(row.n);
}

export async function listCatalog(
  tenantId: string,
  outletId?: string,
): Promise<readonly CatalogItem[]> {
  const rows = await query<{
    sku_id: string;
    code: string;
    name: string;
    category: string | null;
    price_cents: string;
    unit: string;
    stock: string | null;
  }>(
    `SELECT s.id AS sku_id, s.code, p.name, p.category,
            s.price_cents::text, s.unit,
            coalesce(SUM(l.delta), 0)::text AS stock
     FROM sku s
     JOIN variant v ON v.id = s.variant_id
     JOIN product p ON p.id = v.product_id
     LEFT JOIN stock_ledger l
       ON l.sku_id = s.id
      AND l.tenant_id = s.tenant_id
      AND ($2::text IS NULL OR l.outlet_id = $2)
     WHERE s.tenant_id = $1
     GROUP BY s.id, s.code, p.name, p.category, s.price_cents, s.unit
     ORDER BY p.category NULLS LAST, p.name`,
    [tenantId, outletId ?? null],
  );

  return rows.map((row) =>
    Object.freeze({
      skuId: row.sku_id,
      code: row.code,
      name: row.name,
      category: row.category,
      priceCents: Number(row.price_cents),
      unit: row.unit,
      stock: Number(row.stock ?? 0),
    }),
  );
}

export type SaleLine = { readonly skuId: string; readonly qty: number };

/**
 * Mencatat satu penjualan: pesanan, barisnya, pengurangan stok, dan kas masuk
 * dalam satu transaksi. Kalau salah satu gagal, tidak ada yang tercatat.
 *
 * Stok dikurangi dengan menambah baris buku besar bernilai negatif — tidak
 * pernah dengan mengubah angka.
 */
export async function recordSale(
  tenantId: string,
  input: {
    readonly channel: 'pos' | 'store';
    readonly outletId: string;
    readonly lines: readonly SaleLine[];
    readonly orderId: string;
  },
): Promise<{ orderId: string; totalCents: number }> {
  if (input.lines.length === 0) {
    throw new DbError('Penjualan tanpa barang tidak bisa dicatat.');
  }
  if (input.lines.some((line) => line.qty <= 0)) {
    throw new DbError('Jumlah barang harus lebih dari nol.');
  }

  return transaction(async (client) => {
    const skuIds = input.lines.map((line) => line.skuId);
    const priced = await client.query<{ id: string; price_cents: string }>(
      'SELECT id, price_cents::text FROM sku WHERE tenant_id = $1 AND id = ANY($2)',
      [tenantId, skuIds],
    );

    // Harga selalu diambil dari database, tidak pernah dari sisi klien.
    const priceOf = new Map(priced.rows.map((row) => [row.id, Number(row.price_cents)]));
    const missing = skuIds.filter((id) => !priceOf.has(id));
    if (missing.length > 0) {
      throw new DbError(`Barang tidak ditemukan di toko ini: ${missing.join(', ')}`);
    }

    let totalCents = 0;
    for (const line of input.lines) {
      totalCents += (priceOf.get(line.skuId) ?? 0) * line.qty;
    }

    await client.query(
      `INSERT INTO "order" (id, tenant_id, channel, outlet_id, status, total_cents)
       VALUES ($1, $2, $3, $4, 'paid', $5)`,
      [input.orderId, tenantId, input.channel, input.outletId, totalCents],
    );

    let index = 0;
    for (const line of input.lines) {
      index += 1;
      const unitPrice = priceOf.get(line.skuId) ?? 0;
      await client.query(
        `INSERT INTO order_line (id, order_id, sku_id, qty, unit_price_cents)
         VALUES ($1, $2, $3, $4, $5)`,
        [`${input.orderId}_l${index}`, input.orderId, line.skuId, line.qty, unitPrice],
      );
      await client.query(
        `INSERT INTO stock_ledger (tenant_id, sku_id, outlet_id, delta, reason, ref_type, ref_id)
         VALUES ($1, $2, $3, $4, 'sale', 'order', $5)`,
        [tenantId, line.skuId, input.outletId, -line.qty, input.orderId],
      );
    }

    await client.query(
      `INSERT INTO cash_entry (tenant_id, direction, amount_cents, reason, ref_type, ref_id)
       VALUES ($1, 'in', $2, 'Penjualan', 'order', $3)`,
      [tenantId, totalCents, input.orderId],
    );

    return { orderId: input.orderId, totalCents };
  });
}
