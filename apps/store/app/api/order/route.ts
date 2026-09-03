import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { DbError, recordStoreOrder } from "@pasarkita/db";
import { outletIdFor, resolveTenantId } from "@/lib/tenant/resolve";

export const dynamic = "force-dynamic";

const SHIPPING_LABELS = ["Reguler (3-5 hari)", "Express (1-2 hari)"] as const;
const MAX_SHIPPING_CENTS = 100_000_00;

type OrderRequest = {
  idempotencyKey: string;
  lines: { skuId: string; qty: number }[];
  recipientName: string;
  recipientPhone: string;
  address: string;
  shippingLabel: string;
  shippingCents: number;
  paymentMethod: "transfer" | "qris";
};

/**
 * Memvalidasi badan permintaan di batas sistem.
 *
 * Harga barang TIDAK diterima dari klien sama sekali — server menghitungnya
 * ulang dari basis data. Yang diterima dari klien hanya biaya kirim, dan itu
 * pun dibatasi supaya tidak bisa dikirim nilai aneh.
 */
function parseRequest(body: unknown): OrderRequest {
  if (typeof body !== "object" || body === null) {
    throw new Error("Badan permintaan tidak dikenal.");
  }
  const raw = body as Record<string, unknown>;

  const key = raw.idempotencyKey;
  if (typeof key !== "string" || key.length < 8 || key.length > 100) {
    throw new Error("Kunci pesanan tidak sah.");
  }

  if (!Array.isArray(raw.lines) || raw.lines.length === 0) {
    throw new Error("Keranjang kosong.");
  }
  if (raw.lines.length > 100) throw new Error("Terlalu banyak barang dalam satu pesanan.");

  const lines = raw.lines.map((item) => {
    const line = item as { skuId?: unknown; qty?: unknown };
    if (typeof line.skuId !== "string" || line.skuId.length === 0) {
      throw new Error("Ada barang tanpa kode.");
    }
    if (
      typeof line.qty !== "number" ||
      !Number.isInteger(line.qty) ||
      line.qty <= 0 ||
      line.qty > 1000
    ) {
      throw new Error("Jumlah barang tidak masuk akal.");
    }
    return { skuId: line.skuId, qty: line.qty };
  });

  const text = (value: unknown, field: string, max: number): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`${field} wajib diisi.`);
    }
    if (value.length > max) throw new Error(`${field} terlalu panjang.`);
    return value.trim();
  };

  const shippingLabel = text(raw.shippingLabel, "Pilihan pengiriman", 100);
  if (!(SHIPPING_LABELS as readonly string[]).includes(shippingLabel)) {
    throw new Error("Pilihan pengiriman tidak dikenal.");
  }

  const shippingCents = raw.shippingCents;
  if (
    typeof shippingCents !== "number" ||
    !Number.isFinite(shippingCents) ||
    shippingCents < 0 ||
    shippingCents > MAX_SHIPPING_CENTS
  ) {
    throw new Error("Biaya kirim tidak sah.");
  }

  const paymentMethod = raw.paymentMethod;
  if (paymentMethod !== "transfer" && paymentMethod !== "qris") {
    throw new Error("Metode pembayaran tidak dikenal.");
  }

  return {
    idempotencyKey: key,
    lines,
    recipientName: text(raw.recipientName, "Nama penerima", 200),
    recipientPhone: text(raw.recipientPhone, "Nomor telepon", 40),
    address: text(raw.address, "Alamat", 1000),
    shippingLabel,
    shippingCents: Math.round(shippingCents),
    paymentMethod,
  };
}

export async function POST(request: Request) {
  let input: OrderRequest;
  try {
    input = parseRequest(await request.json());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Permintaan tidak sah." },
      { status: 400 },
    );
  }

  const tenantId = await resolveTenantId();

  try {
    const result = await recordStoreOrder(tenantId, {
      ...input,
      orderId: randomUUID(),
      outletId: outletIdFor(tenantId),
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof DbError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[store] gagal menyimpan pesanan:", error);
    return NextResponse.json(
      { error: "Pesanan tidak tersimpan. Tidak ada yang tercatat sebagian." },
      { status: 500 },
    );
  }
}
