'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Payment, { type PaymentMethod } from './Payment';
import { enqueue, flush, newKey, pendingCount, remove } from './lib/queue';

type Item = {
  skuId: string;
  code: string;
  name: string;
  category: string | null;
  priceCents: number;
  unit: string;
  stock: number;
};

type Receipt = {
  totalCents: number;
  changeCents: number;
  offline: boolean;
};

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export default function Register({ items }: { items: readonly Item[] }) {
  const [cart, setCart] = useState<ReadonlyMap<string, number>>(new Map());
  const [search, setSearch] = useState('');
  const [paying, setPaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);

  const byId = useMemo(() => new Map(items.map((item) => [item.skuId, item])), [items]);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (needle === '') return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(needle) || item.code.toLowerCase().includes(needle),
    );
  }, [items, search]);

  const total = useMemo(() => {
    let sum = 0;
    for (const [skuId, qty] of cart) sum += (byId.get(skuId)?.priceCents ?? 0) * qty;
    return sum;
  }, [cart, byId]);

  const drain = useCallback(async () => {
    const result = await flush();
    setQueued(pendingCount());
    return result;
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    setQueued(pendingCount());

    const goOnline = () => {
      setOnline(true);
      void drain();
    };
    const goOffline = () => setOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    if (navigator.onLine) void drain();

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [drain]);

  function add(skuId: string) {
    setError(null);
    setCart((current) => {
      const next = new Map(current);
      const item = byId.get(skuId);
      const inCart = next.get(skuId) ?? 0;
      if (item && inCart >= item.stock) return current;
      next.set(skuId, inCart + 1);
      return next;
    });
  }

  function setQty(skuId: string, qty: number) {
    setCart((current) => {
      const next = new Map(current);
      if (qty <= 0) next.delete(skuId);
      else next.set(skuId, Math.min(qty, byId.get(skuId)?.stock ?? qty));
      return next;
    });
  }

  async function confirm(method: PaymentMethod, tenderedCents: number | null) {
    if (cart.size === 0 || busy) return;
    setBusy(true);
    setError(null);

    const sale = {
      idempotencyKey: newKey(),
      lines: [...cart].map(([skuId, qty]) => ({ skuId, qty })),
      paymentMethod: method,
      tenderedCents,
      totalCents: total,
      createdAt: Date.now(),
    };

    // Simpan dulu, baru kirim. Kalau perangkat mati di tengah jalan,
    // transaksinya tidak hilang.
    enqueue(sale);
    setQueued(pendingCount());

    try {
      const response = await fetch('/api/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey: sale.idempotencyKey,
          lines: sale.lines,
          paymentMethod: sale.paymentMethod,
          tenderedCents: sale.tenderedCents,
        }),
      });
      const result = (await response.json()) as { ok?: boolean; changeCents?: number; error?: string };

      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          // Server menolak isinya — mengirim ulang tidak akan menolong.
          remove(sale.idempotencyKey);
          setQueued(pendingCount());
          setError(result.error ?? 'Transaksi ditolak.');
          return;
        }
        throw new Error('server');
      }

      remove(sale.idempotencyKey);
      setQueued(pendingCount());
      setCart(new Map());
      setPaying(false);
      setReceipt({
        totalCents: total,
        changeCents: result.changeCents ?? 0,
        offline: false,
      });
    } catch {
      // Tidak tersambung atau server bermasalah. Transaksi sudah tersimpan
      // di antrean dan akan dikirim sendiri begitu jaringan kembali.
      setCart(new Map());
      setPaying(false);
      setReceipt({
        totalCents: total,
        changeCents: tenderedCents === null ? 0 : Math.max(0, tenderedCents - total),
        offline: true,
      });
    } finally {
      setBusy(false);
    }
  }

  if (receipt !== null) {
    return (
      <section className="panel" aria-live="polite">
        <h2 style={{ marginTop: 0 }}>Transaksi selesai</h2>
        <div className="panel-row">
          <span className="label">Total</span>
          <strong className="total">{rupiah.format(receipt.totalCents / 100)}</strong>
        </div>
        {receipt.changeCents > 0 ? (
          <div className="panel-row">
            <span className="label">Kembalian</span>
            <strong className="change">{rupiah.format(receipt.changeCents / 100)}</strong>
          </div>
        ) : null}
        {receipt.offline ? (
          <p className="notice">
            Tersimpan di perangkat ini. Transaksi terkirim sendiri begitu internet kembali &mdash;
            tidak perlu diulang, dan tidak akan tercatat dua kali.
          </p>
        ) : null}
        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={() => setReceipt(null)}>
            Transaksi berikutnya
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="statusline">
        <span className={online ? 'dot-on' : 'dot-off'} />
        <span className="small">{online ? 'Tersambung' : 'Tidak tersambung — transaksi tetap bisa jalan'}</span>
        {queued > 0 ? (
          <button type="button" className="btn small" onClick={() => void drain()}>
            {queued} menunggu kirim
          </button>
        ) : null}
      </div>

      {paying ? (
        <Payment
          totalCents={total}
          busy={busy}
          onCancel={() => setPaying(false)}
          onConfirm={confirm}
        />
      ) : (
        <>
          <label className="searchbox">
            <span className="sr-only">Cari barang</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama atau kode barang…"
            />
          </label>

          <div className="grid grid-4">
            {visible.map((item) => {
              const inCart = cart.get(item.skuId) ?? 0;
              const habis = item.stock <= 0;
              return (
                <button
                  key={item.skuId}
                  type="button"
                  className="card-btn"
                  onClick={() => add(item.skuId)}
                  disabled={habis || inCart >= item.stock}
                >
                  <span className="nm">{item.name}</span>
                  <span className="pr">{rupiah.format(item.priceCents / 100)}</span>
                  <span className="st">
                    {habis ? 'Stok habis' : `Sisa ${item.stock} ${item.unit}`}
                    {inCart > 0 ? ` · ${inCart} di keranjang` : ''}
                  </span>
                </button>
              );
            })}
          </div>

          {visible.length === 0 ? (
            <p className="muted small">Tidak ada barang yang cocok dengan &ldquo;{search}&rdquo;.</p>
          ) : null}

          {cart.size > 0 ? (
            <section className="panel">
              <h2 style={{ marginTop: 0 }}>Keranjang</h2>
              <div className="tablewrap">
                <table>
                  <thead>
                    <tr>
                      <th>Barang</th>
                      <th className="num">Jumlah</th>
                      <th className="num">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...cart].map(([skuId, qty]) => {
                      const item = byId.get(skuId);
                      if (!item) return null;
                      return (
                        <tr key={skuId}>
                          <td>{item.name}</td>
                          <td className="num">
                            <span className="qty">
                              <button type="button" className="btn small" onClick={() => setQty(skuId, qty - 1)} aria-label={`Kurangi ${item.name}`}>
                                &minus;
                              </button>
                              <span>{qty}</span>
                              <button type="button" className="btn small" onClick={() => setQty(skuId, qty + 1)} aria-label={`Tambah ${item.name}`} disabled={qty >= item.stock}>
                                +
                              </button>
                            </span>
                          </td>
                          <td className="num">{rupiah.format((item.priceCents * qty) / 100)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="panel-row">
                <span className="label">Total</span>
                <strong className="total">{rupiah.format(total / 100)}</strong>
              </div>
              <div className="actions">
                <button type="button" className="btn" onClick={() => setCart(new Map())}>
                  Kosongkan
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setPaying(true)}>
                  Bayar
                </button>
              </div>
            </section>
          ) : (
            <p className="muted small">Ketuk barang di atas untuk menambahkan ke keranjang.</p>
          )}
        </>
      )}

      {error === null ? null : (
        <p className="notice" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
