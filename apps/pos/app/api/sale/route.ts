import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { ForbiddenError, guard, readSecret, readSession } from '@pasarkita/auth';
import { recordSale } from '@pasarkita/db';

export const dynamic = 'force-dynamic';

type Line = { skuId: string; qty: number };

/** Memvalidasi badan permintaan di batas sistem. Jangan percaya bentuk apa pun dari klien. */
function parseLines(body: unknown): Line[] {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Badan permintaan tidak dikenal.');
  }
  const lines = (body as { lines?: unknown }).lines;
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error('Keranjang kosong.');
  }
  if (lines.length > 200) {
    throw new Error('Terlalu banyak baris dalam satu transaksi.');
  }
  return lines.map((raw) => {
    const line = raw as { skuId?: unknown; qty?: unknown };
    if (typeof line.skuId !== 'string' || line.skuId.length === 0) {
      throw new Error('Ada baris tanpa barang.');
    }
    if (typeof line.qty !== 'number' || !Number.isInteger(line.qty) || line.qty <= 0) {
      throw new Error('Jumlah barang harus bilangan bulat lebih dari nol.');
    }
    return { skuId: line.skuId, qty: line.qty };
  });
}

export async function POST(request: Request) {
  const session = readSession(request.headers.get('cookie'), readSecret());
  if (session === null) {
    return NextResponse.json({ error: 'Sesi tidak ditemukan. Muat ulang halaman.' }, { status: 401 });
  }

  try {
    // Sesi demo boleh mencatat penjualan — itu inti demonya. Yang ditolak
    // adalah aksi yang keluar dari kotak pasir, dan createOrder bukan salah satunya.
    guard({ session, app: 'pos', action: 'createOrder' });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }

  let lines: Line[];
  try {
    lines = parseLines(await request.json());
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Permintaan tidak sah.';
    return NextResponse.json({ error: detail }, { status: 400 });
  }

  try {
    const result = await recordSale(session.tenantId, {
      channel: 'pos',
      outletId: `${session.tenantId}_outlet`,
      lines,
      orderId: randomUUID(),
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('[pos] gagal mencatat penjualan:', error);
    return NextResponse.json(
      { error: 'Transaksi tidak bisa disimpan. Tidak ada yang tercatat sebagian.' },
      { status: 500 },
    );
  }
}
