'use client';

/**
 * Antrean transaksi saat kasir tidak tersambung.
 *
 * Transaksi disimpan di perangkat lebih dulu, baru dikirim. Kalau pengiriman
 * gagal karena jaringan, transaksinya tetap di antrean dan dicoba lagi nanti.
 * Setiap transaksi membawa kunci tetap, jadi mengirim ulang tidak pernah
 * menghasilkan penjualan dobel di server.
 *
 * Memakai localStorage, bukan IndexedDB: antrean ini berumur menit, isinya
 * puluhan baris, dan penulisan sinkron justru lebih aman ketika halaman
 * ditutup mendadak. Semua akses dibungkus try/catch karena penyimpanan bisa
 * ditolak browser (mode privat, kuota penuh).
 */

const KEY = 'pk_pos_queue_v1';
const MAX_ENTRIES = 500;

export type QueuedSale = {
  readonly idempotencyKey: string;
  readonly lines: readonly { skuId: string; qty: number }[];
  readonly paymentMethod: 'cash' | 'qris' | 'card' | 'transfer';
  readonly tenderedCents: number | null;
  readonly totalCents: number;
  readonly createdAt: number;
};

function read(): QueuedSale[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QueuedSale[]) : [];
  } catch {
    return [];
  }
}

function write(entries: readonly QueuedSale[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    // Penyimpanan penuh atau ditolak. Transaksi tetap dikirim dari memori;
    // yang hilang hanya kemampuan mencoba lagi setelah halaman ditutup.
    console.error('[pos] antrean tidak bisa disimpan di perangkat ini.');
  }
}

export function enqueue(sale: QueuedSale): void {
  write([...read(), sale]);
}

export function remove(idempotencyKey: string): void {
  write(read().filter((entry) => entry.idempotencyKey !== idempotencyKey));
}

export function pending(): QueuedSale[] {
  return read();
}

export function pendingCount(): number {
  return read().length;
}

export type FlushResult = { sent: number; failed: number };

/**
 * Mengirim ulang isi antrean satu per satu.
 *
 * Kegagalan jaringan menyisakan transaksi di antrean untuk dicoba lagi.
 * Penolakan dari server (400/403) berarti transaksi itu tidak akan pernah
 * diterima, jadi dibuang supaya tidak menyumbat antrean selamanya.
 */
export async function flush(): Promise<FlushResult> {
  let sent = 0;
  let failed = 0;

  for (const entry of pending()) {
    try {
      const response = await fetch('/api/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey: entry.idempotencyKey,
          lines: entry.lines,
          paymentMethod: entry.paymentMethod,
          tenderedCents: entry.tenderedCents,
        }),
      });

      if (response.ok) {
        remove(entry.idempotencyKey);
        sent += 1;
        continue;
      }

      if (response.status >= 400 && response.status < 500) {
        console.error(`[pos] transaksi ${entry.idempotencyKey} ditolak server; dibuang dari antrean.`);
        remove(entry.idempotencyKey);
        failed += 1;
        continue;
      }

      failed += 1;
    } catch {
      // Masih tidak tersambung. Biarkan di antrean.
      failed += 1;
    }
  }

  return { sent, failed };
}

export function newKey(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `pk-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }
}
