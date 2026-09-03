"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, CloudOff, Minus, Plus, Search, Wifi } from "lucide-react";
import Payment, { type PaymentMethod } from "./Payment";
import { enqueue, flush, newKey, pendingCount, remove } from "./lib/queue";

type Item = {
  skuId: string;
  code: string;
  name: string;
  category: string | null;
  priceCents: number;
  unit: string;
  stock: number;
  images?: readonly string[];
};

type Receipt = { totalCents: number; changeCents: number; offline: boolean };

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f4f1ea'/%3E%3C/svg%3E";

export default function Register({ items }: { items: readonly Item[] }) {
  const [cart, setCart] = useState<ReadonlyMap<string, number>>(new Map());
  const [search, setSearch] = useState("");
  const [paying, setPaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);

  const byId = useMemo(() => new Map(items.map((i) => [i.skuId, i])), [items]);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (needle === "") return items;
    return items.filter(
      (i) => i.name.toLowerCase().includes(needle) || i.code.toLowerCase().includes(needle),
    );
  }, [items, search]);

  const total = useMemo(() => {
    let sum = 0;
    for (const [skuId, qty] of cart) sum += (byId.get(skuId)?.priceCents ?? 0) * qty;
    return sum;
  }, [cart, byId]);

  const itemCount = useMemo(() => {
    let n = 0;
    for (const qty of cart.values()) n += qty;
    return n;
  }, [cart]);

  const drain = useCallback(async () => {
    await flush();
    setQueued(pendingCount());
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    setQueued(pendingCount());
    const goOnline = () => {
      setOnline(true);
      void drain();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    if (navigator.onLine) void drain();
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [drain]);

  // Selalu Map baru — jangan pernah mengubah state di tempat.
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
    // transaksinya tidak ikut hilang.
    enqueue(sale);
    setQueued(pendingCount());

    try {
      const response = await fetch("/api/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: sale.idempotencyKey,
          lines: sale.lines,
          paymentMethod: sale.paymentMethod,
          tenderedCents: sale.tenderedCents,
        }),
      });
      const result = (await response.json()) as { changeCents?: number; error?: string };

      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          // Ditolak isinya — mengirim ulang tidak akan menolong.
          remove(sale.idempotencyKey);
          setQueued(pendingCount());
          setError(result.error ?? "Transaksi ditolak.");
          return;
        }
        throw new Error("server");
      }

      remove(sale.idempotencyKey);
      setQueued(pendingCount());
      setCart(new Map());
      setPaying(false);
      setReceipt({ totalCents: total, changeCents: result.changeCents ?? 0, offline: false });
    } catch {
      // Tidak tersambung. Transaksi sudah tersimpan di antrean dan akan
      // terkirim sendiri begitu jaringan kembali.
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
      <div className="mx-auto max-w-lg px-3.5 py-6 sm:px-6">
        <section className="flex flex-col gap-4 rounded-(--radius-card) border border-border bg-white p-5 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft">
            <Check size={26} className="text-success" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-deep-pine">Transaksi selesai</h2>
            <p className="tabular mt-1 text-3xl font-bold tracking-tight text-ink">
              {rupiah.format(receipt.totalCents / 100)}
            </p>
          </div>

          {receipt.changeCents > 0 ? (
            <div className="flex items-baseline justify-between rounded-xl bg-success-soft px-4 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Kembalian
              </span>
              <strong className="tabular text-2xl font-bold text-success">
                {rupiah.format(receipt.changeCents / 100)}
              </strong>
            </div>
          ) : null}

          {receipt.offline ? (
            <p className="rounded-xl border border-border border-l-4 border-l-status-warning bg-warning-soft px-3.5 py-2.5 text-left text-xs leading-relaxed text-ink">
              Tersimpan di perangkat ini. Transaksi terkirim sendiri begitu internet kembali —
              tidak perlu diulang, dan tidak akan tercatat dua kali.
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => setReceipt(null)}
            className="tap-target-pos rounded-full bg-karyalo-green text-sm font-semibold text-warm-white hover:opacity-90"
          >
            Transaksi berikutnya
          </button>
        </section>
      </div>
    );
  }

  if (paying) {
    return (
      <div className="px-3.5 py-5 sm:px-6">
        <Payment
          totalCents={total}
          busy={busy}
          onCancel={() => setPaying(false)}
          onConfirm={confirm}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-(--container-wide) px-3.5 pb-32 pt-4 sm:px-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            online ? "bg-success-soft text-success" : "bg-warning-soft text-status-warning"
          }`}
        >
          {online ? <Wifi size={12} aria-hidden="true" /> : <CloudOff size={12} aria-hidden="true" />}
          {online ? "Tersambung" : "Tanpa internet — transaksi tetap bisa jalan"}
        </span>

        {queued > 0 ? (
          <button
            type="button"
            onClick={() => void drain()}
            className="tap-target rounded-full border border-status-warning bg-warning-soft px-3 py-1 text-[11px] font-semibold text-status-warning"
          >
            {queued} menunggu kirim · coba lagi
          </button>
        ) : null}
      </div>

      <label className="relative mb-4 block">
        <span className="sr-only">Cari barang</span>
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau kode barang…"
          className="tap-target-pos w-full rounded-xl border border-border bg-white pl-10 pr-3.5 text-sm text-ink outline-none focus:border-karyalo-green"
        />
      </label>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visible.map((item) => {
          const inCart = cart.get(item.skuId) ?? 0;
          const habis = item.stock <= 0;
          const penuh = inCart >= item.stock;
          return (
            <button
              key={item.skuId}
              type="button"
              onClick={() => add(item.skuId)}
              disabled={habis || penuh}
              className="group relative flex flex-col overflow-hidden rounded-(--radius-card) border border-border bg-white text-left transition-colors hover:border-karyalo-green disabled:opacity-45 disabled:hover:border-border"
            >
              <span className="relative block aspect-square w-full bg-soft-sand">
                <Image
                  src={item.images?.[0] ?? PLACEHOLDER}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover"
                />
                {inCart > 0 ? (
                  <span className="tabular absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-karyalo-green text-[11px] font-bold text-warm-white">
                    {inCart}
                  </span>
                ) : null}
              </span>
              <span className="flex flex-1 flex-col gap-0.5 p-2.5">
                <span className="line-clamp-2 text-xs font-semibold leading-snug text-ink">
                  {item.name}
                </span>
                <span className="tabular text-sm font-bold text-karyalo-green">
                  {rupiah.format(item.priceCents / 100)}
                </span>
                <span className="text-[11px] text-muted">
                  {habis ? "Stok habis" : `Sisa ${item.stock} ${item.unit}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          Tidak ada barang yang cocok dengan &ldquo;{search}&rdquo;.
        </p>
      ) : null}

      {error === null ? null : (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-status-critical/30 bg-status-critical/5 px-3.5 py-2.5 text-xs font-medium text-status-critical"
        >
          {error}
        </p>
      )}

      {/* Keranjang menempel di bawah: kasir memakainya sambil berdiri, dan
          jempol berada di sana. */}
      {cart.size > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-warm-white/95 backdrop-blur">
          <div className="mx-auto max-w-(--container-wide) px-3.5 py-3 sm:px-6">
            <div className="mb-2 max-h-40 overflow-y-auto">
              {[...cart].map(([skuId, qty]) => {
                const item = byId.get(skuId);
                if (!item) return null;
                return (
                  <div
                    key={skuId}
                    className="flex items-center gap-2 border-b border-border/60 py-1.5 last:border-0"
                  >
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink">
                      {item.name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setQty(skuId, qty - 1)}
                        aria-label={`Kurangi ${item.name}`}
                        className="tap-target flex size-8 items-center justify-center rounded-lg border border-border text-ink hover:border-karyalo-green"
                      >
                        <Minus size={13} aria-hidden="true" />
                      </button>
                      <span className="tabular w-6 text-center text-sm font-bold text-ink">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(skuId, qty + 1)}
                        disabled={qty >= item.stock}
                        aria-label={`Tambah ${item.name}`}
                        className="tap-target flex size-8 items-center justify-center rounded-lg border border-border text-ink hover:border-karyalo-green disabled:opacity-40"
                      >
                        <Plus size={13} aria-hidden="true" />
                      </button>
                    </span>
                    <span className="tabular w-24 shrink-0 text-right text-xs font-semibold text-ink">
                      {rupiah.format((item.priceCents * qty) / 100)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setCart(new Map())}
                className="tap-target-pos shrink-0 rounded-full border border-border px-4 text-xs font-semibold text-muted hover:border-ink hover:text-ink"
              >
                Kosongkan
              </button>
              <div className="min-w-0 flex-1 text-right">
                <p className="text-[11px] text-muted">{itemCount} barang</p>
                <p className="tabular truncate text-xl font-bold leading-tight text-deep-pine">
                  {rupiah.format(total / 100)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaying(true)}
                className="tap-target-pos shrink-0 rounded-full bg-karyalo-green px-8 text-sm font-semibold text-warm-white hover:opacity-90"
              >
                Bayar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
