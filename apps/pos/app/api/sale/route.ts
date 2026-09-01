import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { ForbiddenError, guard, readSecret, readSession } from '@pasarkita/auth';
import { DbError, findOpenShift, recordPosSale } from '@pasarkita/db';

export const dynamic = 'force-dynamic';

const PAYMENT_METHODS = ['cash', 'qris', 'card', 'transfer'] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

type SaleRequest = {
  idempotencyKey: string;
  lines: { skuId: string; qty: number }[];
  paymentMethod: PaymentMethod;
  tenderedCents: number | null;
};

/** Memvalidasi badan permintaan di batas sistem. Bentuk apa pun dari klien tidak dipercaya. */
function parseRequest(body: unknown): SaleRequest {
  if (typeof body !== 'object' || body === null) throw new Error('Badan permintaan tidak dikenal.');
  const raw = body as Record<string, unknown>;

  const key = raw.idempotencyKey;
  if (typeof key !== 'string' || key.length < 8 || key.length > 100) {
    throw new Error('Kunci transaksi tidak sah.');
  }

  const method = raw.paymentMethod;
  if (typeof method !== 'string' || !(PAYMENT_METHODS as readonly string[]).includes(method)) {
    throw new Error('Metode pembayaran tidak dikenal.');
  }

  if (!Array.isArray(raw.lines) || raw.lines.length === 0) throw new Error('Keranjang kosong.');
  if (raw.lines.length > 200) throw new Error('Terlalu banyak baris dalam satu transaksi.');

  const lines = raw.lines.map((item) => {
    const line = item as { skuId?: unknown; qty?: unknown };
    if (typeof line.skuId !== 'string' || line.skuId.length === 0) {
      throw new Error('Ada baris tanpa barang.');
    }
    if (typeof line.qty !== 'number' || !Number.isInteger(line.qty) || line.qty <= 0 || line.qty > 10_000) {
      throw new Error('Jumlah barang tidak masuk akal.');
    }
    return { skuId: line.skuId, qty: line.qty };
  });

  const tendered = raw.tenderedCents;
  if (tendered !== null && tendered !== undefined) {
    if (typeof tendered !== 'number' || !Number.isFinite(tendered) || tendered < 0) {
      throw new Error('Uang yang diterima tidak sah.');
    }
  }

  return {
    idempotencyKey: key,
    lines,
    paymentMethod: method as PaymentMethod,
    tenderedCents: typeof tendered === 'number' ? Math.round(tendered) : null,
  };
}

export async function POST(request: Request) {
  const session = readSession(request.headers.get('cookie'), readSecret());
  if (session === null) {
    return NextResponse.json({ error: 'Sesi berakhir. Muat ulang halaman.' }, { status: 401 });
  }

  try {
    guard({ session, app: 'pos', action: 'createOrder' });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }

  let input: SaleRequest;
  try {
    input = parseRequest(await request.json());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Permintaan tidak sah.' },
      { status: 400 },
    );
  }

  const outletId = `${session.tenantId}_outlet`;

  try {
    const shift = await findOpenShift(session.tenantId, outletId);
    const result = await recordPosSale(session.tenantId, {
      ...input,
      outletId,
      orderId: randomUUID(),
      shiftId: shift?.id ?? null,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    // Kesalahan yang bisa diperbaiki kasir ditampilkan apa adanya; sisanya
    // dicatat di server dan dibalas dengan pesan umum.
    if (error instanceof DbError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('[pos] gagal mencatat penjualan:', error);
    return NextResponse.json(
      { error: 'Transaksi tidak tersimpan. Tidak ada yang tercatat sebagian.' },
      { status: 500 },
    );
  }
}
