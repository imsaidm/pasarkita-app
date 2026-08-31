'use client';

import { useMemo, useState } from 'react';

type Item = {
  skuId: string;
  code: string;
  name: string;
  category: string | null;
  priceCents: number;
  unit: string;
  stock: number;
};

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export default function Register({ items }: { items: readonly Item[] }) {
  const [cart, setCart] = useState<ReadonlyMap<string, number>>(new Map());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const byId = useMemo(() => new Map(items.map((item) => [item.skuId, item])), [items]);

  const total = useMemo(() => {
    let sum = 0;
    for (const [skuId, qty] of cart) sum += (byId.get(skuId)?.priceCents ?? 0) * qty;
    return sum;
  }, [cart, byId]);

  // Selalu membuat Map baru — jangan pernah mengubah state di tempat.
  function add(skuId: string) {
    setMessage(null);
    setCart((current) => {
      const next = new Map(current);
      const item = byId.get(skuId);
      const inCart = next.get(skuId) ?? 0;
      if (item && inCart >= item.stock) return current;
      next.set(skuId, inCart + 1);
      return next;
    });
  }

  function remove(skuId: string) {
    setCart((current) => {
      const next = new Map(current);
      const inCart = next.get(skuId) ?? 0;
      if (inCart <= 1) next.delete(skuId);
      else next.set(skuId, inCart - 1);
      return next;
    });
  }

  async function submit() {
    if (cart.size === 0 || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch('/api/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: [...cart].map(([skuId, qty]) => ({ skuId, qty })),
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        setMessage(result.error ?? 'Transaksi gagal disimpan. Coba lagi.');
        return;
      }
      setCart(new Map());
      setMessage(`Transaksi tersimpan. Total ${rupiah.format(total / 100)}.`);
    } catch {
      setMessage('Tidak bisa menghubungi server. Periksa koneksi lalu coba lagi.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h2>Pilih barang</h2>
      <div className="grid grid-4">
        {items.map((item) => {
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

      <h2>Keranjang</h2>
      {cart.size === 0 ? (
        <p className="muted small">Belum ada barang. Ketuk produk di atas untuk menambahkan.</p>
      ) : (
        <>
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Barang</th>
                  <th className="num">Jumlah</th>
                  <th className="num">Subtotal</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {[...cart].map(([skuId, qty]) => {
                  const item = byId.get(skuId);
                  if (!item) return null;
                  return (
                    <tr key={skuId}>
                      <td>{item.name}</td>
                      <td className="num">{qty}</td>
                      <td className="num">{rupiah.format((item.priceCents * qty) / 100)}</td>
                      <td className="num">
                        <button type="button" className="btn small" onClick={() => remove(skuId)}>
                          &minus;
                        </button>
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td>
                    <strong>Total</strong>
                  </td>
                  <td />
                  <td className="num">
                    <strong>{rupiah.format(total / 100)}</strong>
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: '1rem' }}>
            <button className="btn btn-primary" type="button" onClick={submit} disabled={busy}>
              {busy ? 'Menyimpan…' : 'Simpan transaksi'}
            </button>
          </p>
        </>
      )}

      {message === null ? null : (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </>
  );
}
