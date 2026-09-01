import { DbError, query, queryOne, transaction } from './client';

/**
 * Kueri khusus kasir: shift dan penjualan yang tahan kirim ulang.
 */

export type Shift = {
  readonly id: string;
  readonly outletId: string;
  readonly openedAt: string;
  readonly openingCents: number;
};

export type SaleLine = { readonly skuId: string; readonly qty: number };

export type SaleInput = {
  /** Dibuat kasir, ikut disimpan di antrean lokal. Kunci anti-dobel. */
  readonly idempotencyKey: string;
  readonly outletId: string;
  readonly lines: readonly SaleLine[];
  readonly paymentMethod: 'cash' | 'qris' | 'card' | 'transfer';
  /** Uang yang diserahkan pembeli. Hanya berarti untuk pembayaran tunai. */
  readonly tenderedCents: number | null;
};

export type SaleResult = {
  readonly orderId: string;
  readonly totalCents: number;
  readonly changeCents: number;
  /** true kalau permintaan ini pengiriman ulang dan transaksinya sudah ada. */
  readonly duplicate: boolean;
};

export async function openShift(
  tenantId: string,
  input: { outletId: string; openedBy: string | null; openingCents: number; shiftId: string },
): Promise<Shift> {
  if (input.openingCents < 0) {
    throw new DbError('Modal awal tidak boleh negatif.');
  }
  try {
    const row = await queryOne<{ id: string; outlet_id: string; opened_at: string; opening_cents: string }>(
      `INSERT INTO cash_shift (id, tenant_id, outlet_id, opened_by, opening_cents)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, outlet_id, opened_at::text, opening_cents::text`,
      [input.shiftId, tenantId, input.outletId, input.openedBy, input.openingCents],
    );
    if (row === null) throw new DbError('Shift gagal dibuka.');
    return {
      id: row.id,
      outletId: row.outlet_id,
      openedAt: row.opened_at,
      openingCents: Number(row.opening_cents),
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    // Indeks unik menjaga satu shift terbuka per outlet.
    if (detail.includes('cash_shift_one_open_per_outlet')) {
      throw new DbError('Masih ada shift yang belum ditutup di outlet ini.');
    }
    throw error;
  }
}

export async function findOpenShift(tenantId: string, outletId: string): Promise<Shift | null> {
  const row = await queryOne<{ id: string; outlet_id: string; opened_at: string; opening_cents: string }>(
    `SELECT id, outlet_id, opened_at::text, opening_cents::text
     FROM cash_shift
     WHERE tenant_id = $1 AND outlet_id = $2 AND closed_at IS NULL`,
    [tenantId, outletId],
  );
  return row === null
    ? null
    : {
        id: row.id,
        outletId: row.outlet_id,
        openedAt: row.opened_at,
        openingCents: Number(row.opening_cents),
      };
}

export type ShiftSummary = {
  readonly openingCents: number;
  readonly salesCents: number;
  readonly cashSalesCents: number;
  readonly orderCount: number;
  /** Yang seharusnya ada di laci: modal awal ditambah penjualan tunai. */
  readonly expectedCashCents: number;
};

export async function summariseShift(tenantId: string, shiftId: string): Promise<ShiftSummary> {
  const row = await queryOne<{
    opening_cents: string;
    sales_cents: string;
    cash_sales_cents: string;
    order_count: string;
  }>(
    `SELECT s.opening_cents::text,
            coalesce(SUM(o.total_cents), 0)::text AS sales_cents,
            coalesce(SUM(o.total_cents) FILTER (WHERE o.payment_method = 'cash'), 0)::text
              AS cash_sales_cents,
            count(o.id)::text AS order_count
     FROM cash_shift s
     LEFT JOIN "order" o ON o.shift_id = s.id AND o.status = 'paid'
     WHERE s.tenant_id = $1 AND s.id = $2
     GROUP BY s.opening_cents`,
    [tenantId, shiftId],
  );
  if (row === null) throw new DbError('Shift tidak ditemukan.');

  const openingCents = Number(row.opening_cents);
  const cashSalesCents = Number(row.cash_sales_cents);
  return {
    openingCents,
    salesCents: Number(row.sales_cents),
    cashSalesCents,
    orderCount: Number(row.order_count),
    expectedCashCents: openingCents + cashSalesCents,
  };
}

export async function closeShift(
  tenantId: string,
  input: { shiftId: string; countedCents: number; note: string | null },
): Promise<ShiftSummary & { countedCents: number; differenceCents: number }> {
  const summary = await summariseShift(tenantId, input.shiftId);
  const updated = await query(
    `UPDATE cash_shift SET closed_at = now(), counted_cents = $3, note = $4
     WHERE tenant_id = $1 AND id = $2 AND closed_at IS NULL`,
    [tenantId, input.shiftId, input.countedCents, input.note],
  );
  void updated;
  return {
    ...summary,
    countedCents: input.countedCents,
    // Selisih ditampilkan apa adanya, tidak pernah disembunyikan atau dibulatkan.
    differenceCents: input.countedCents - summary.expectedCashCents,
  };
}

/**
 * Mencatat penjualan kasir.
 *
 * Aman dikirim ulang: kalau idempotencyKey sudah pernah dipakai tenant ini,
 * transaksi yang lama dikembalikan apa adanya dan tidak ada baris baru yang
 * ditulis. Ini yang membuat antrean offline tidak menghasilkan penjualan dobel.
 */
export async function recordPosSale(
  tenantId: string,
  input: SaleInput & { orderId: string; shiftId: string | null },
): Promise<SaleResult> {
  if (input.lines.length === 0) throw new DbError('Keranjang kosong.');
  if (input.lines.some((line) => line.qty <= 0)) {
    throw new DbError('Jumlah barang harus lebih dari nol.');
  }
  if (input.idempotencyKey.length < 8) {
    throw new DbError('Kunci idempotensi terlalu pendek.');
  }

  const existing = await queryOne<{ id: string; total_cents: string; tendered_cents: string | null }>(
    `SELECT id, total_cents::text, tendered_cents::text
     FROM "order" WHERE tenant_id = $1 AND idempotency_key = $2`,
    [tenantId, input.idempotencyKey],
  );
  if (existing !== null) {
    const total = Number(existing.total_cents);
    const tendered = existing.tendered_cents === null ? null : Number(existing.tendered_cents);
    return {
      orderId: existing.id,
      totalCents: total,
      changeCents: tendered === null ? 0 : Math.max(0, tendered - total),
      duplicate: true,
    };
  }

  return transaction(async (client) => {
    const skuIds = input.lines.map((line) => line.skuId);
    const priced = await client.query<{ id: string; price_cents: string }>(
      'SELECT id, price_cents::text FROM sku WHERE tenant_id = $1 AND id = ANY($2)',
      [tenantId, skuIds],
    );

    // Harga selalu dari database. Angka dari kasir hanya untuk ditampilkan.
    const priceOf = new Map(priced.rows.map((row) => [row.id, Number(row.price_cents)]));
    const missing = skuIds.filter((id) => !priceOf.has(id));
    if (missing.length > 0) {
      throw new DbError(`Barang tidak ada di toko ini: ${missing.join(', ')}`);
    }

    let totalCents = 0;
    for (const line of input.lines) totalCents += (priceOf.get(line.skuId) ?? 0) * line.qty;

    if (input.paymentMethod === 'cash') {
      if (input.tenderedCents === null) {
        throw new DbError('Uang yang diterima belum diisi.');
      }
      if (input.tenderedCents < totalCents) {
        throw new DbError('Uang yang diterima kurang dari total belanja.');
      }
    }

    await client.query(
      `INSERT INTO "order"
         (id, tenant_id, channel, outlet_id, status, total_cents,
          idempotency_key, shift_id, payment_method, tendered_cents)
       VALUES ($1, $2, 'pos', $3, 'paid', $4, $5, $6, $7, $8)`,
      [
        input.orderId,
        tenantId,
        input.outletId,
        totalCents,
        input.idempotencyKey,
        input.shiftId,
        input.paymentMethod,
        input.tenderedCents,
      ],
    );

    let index = 0;
    for (const line of input.lines) {
      index += 1;
      await client.query(
        `INSERT INTO order_line (id, order_id, sku_id, qty, unit_price_cents)
         VALUES ($1, $2, $3, $4, $5)`,
        [`${input.orderId}_l${index}`, input.orderId, line.skuId, line.qty, priceOf.get(line.skuId) ?? 0],
      );
      await client.query(
        `INSERT INTO stock_ledger (tenant_id, sku_id, outlet_id, delta, reason, ref_type, ref_id)
         VALUES ($1, $2, $3, $4, 'sale', 'order', $5)`,
        [tenantId, line.skuId, input.outletId, -line.qty, input.orderId],
      );
    }

    await client.query(
      `INSERT INTO cash_entry (tenant_id, direction, amount_cents, reason, ref_type, ref_id)
       VALUES ($1, 'in', $2, $3, 'order', $4)`,
      [tenantId, totalCents, `Penjualan kasir (${input.paymentMethod})`, input.orderId],
    );

    return {
      orderId: input.orderId,
      totalCents,
      changeCents:
        input.tenderedCents === null ? 0 : Math.max(0, input.tenderedCents - totalCents),
      duplicate: false,
    };
  });
}
