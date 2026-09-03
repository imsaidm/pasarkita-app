"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { formatRupiah } from "@/lib/utils/currency";

/**
 * CHECKOUT-01..09 — disederhanakan jadi satu halaman (bukan wizard
 * berjenjang) sesuai arahan pemilik proyek: mudah dipahami orang awam.
 *
 * PENTING — ini masih SIMULASI di sisi payment/ongkir, bukan checkout
 * sungguhan:
 * - Tidak ada validasi ongkir/stok/harga nyata (§40 API Design
 *   Expectations — itu wewenang backend, prototype ini tidak punya).
 * - Tidak ada integrasi payment gateway (DOKU) — pemilik proyek sudah
 *   eksplisit menunda ini ("doku dan biteship nanti dlu").
 *
 * **Diperbarui 16 Agustus 2026 — order SEKARANG disimpan sungguhan:**
 * sebelumnya order cuma dititipkan ke `sessionStorage` (§53 melarang itu
 * jadi authoritative store). Dipicu oleh pertanyaan pemilik proyek soal
 * push notification admin saat ada pesanan baru (PRD Manage §16.3), form
 * ini sekarang MEMANGGIL mutation `orders.create` (convex/orders.ts) yang
 * jadi order store otoritatif DAN memicu push notification ke Manage.
 * `sessionStorage` TETAP dipakai, tapi sekarang murni hand-off UI ke
 * halaman /checkout/success (supaya halaman itu tidak perlu round-trip
 * baca database untuk menampilkan ringkasan), bukan lagi satu-satunya
 * catatan order.
 *
 * Pesanan disimpan ke PostgreSQL lewat POST /api/order. Harga dihitung ulang
 * di server dari basis data — angka di keranjang hanya untuk ditampilkan.
 *
 * Berbeda dari versi sebelumnya: kegagalan penyimpanan MENGHENTIKAN alur.
 * Sebelumnya kegagalan hanya dicatat ke console lalu tetap lanjut ke halaman
 * sukses — pembeli percaya pesanannya masuk padahal tidak ada yang tercatat.
 * Itu kerugian nyata bagi pembeli dan penjual, bukan sekadar cacat tampilan.
 */

const SHIPPING_OPTIONS = [
  { id: "reguler", label: "Reguler (3-5 hari)", cost: 15000 },
  { id: "express", label: "Express (1-2 hari)", cost: 35000 },
];

const PAYMENT_OPTIONS = [
  { id: "transfer", label: "Transfer Bank" },
  { id: "qris", label: "QRIS" },
];

/** Kunci tetap per usaha checkout, supaya klik ganda tidak jadi dua pesanan. */
function newIdempotencyKey(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `pk-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

export default function CheckoutPage() {
  return <CheckoutForm />;
}

function CheckoutForm() {
  const { items, hydrated, clear } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [shipping, setShipping] = useState(SHIPPING_OPTIONS[0].id);
  const [payment, setPayment] = useState(PAYMENT_OPTIONS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const shippingCost = SHIPPING_OPTIONS.find((o) => o.id === shipping)?.cost ?? 0;
  const total = subtotal + shippingCost;

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Nama penerima wajib diisi.";
    if (!form.phone.trim()) next.phone = "Nomor telepon wajib diisi.";
    if (!form.address.trim()) next.address = "Alamat lengkap wajib diisi.";
    if (!form.city.trim()) next.city = "Kota wajib diisi.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const shippingLabel = SHIPPING_OPTIONS.find((o) => o.id === shipping)?.label ?? "";
    const paymentLabel = PAYMENT_OPTIONS.find((o) => o.id === payment)?.label ?? "";
    const address = [form.address, form.city, form.postalCode].filter(Boolean).join(", ");

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: newIdempotencyKey(),
          lines: items.map((i) => ({ skuId: i.skuId, qty: i.quantity })),
          recipientName: form.name,
          recipientPhone: form.phone,
          address,
          shippingLabel,
          shippingCents: shippingCost * 100,
          paymentMethod: payment === "qris" ? "qris" : "transfer",
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        orderId?: string;
        error?: string;
      };

      if (!response.ok || !result.ok || !result.orderId) {
        setErrors({
          submit:
            result.error ??
            "Pesanan gagal disimpan. Belum ada yang tercatat, silakan coba lagi.",
        });
        return;
      }

      // Ringkasan dititipkan supaya halaman sukses tidak perlu membaca ulang
      // basis data. Ini murni serah-terima antar halaman, bukan catatan
      // pesanan — catatan sungguhannya sudah tersimpan di server.
      try {
        window.sessionStorage.setItem(
          "pk.lastOrder",
          JSON.stringify({
            orderId: result.orderId,
            items,
            subtotal,
            shippingCost,
            total,
            shippingLabel,
            paymentLabel,
            recipientName: form.name,
          })
        );
      } catch {
        // Penyimpanan sesi ditolak browser. Halaman sukses tampil generik.
      }

      clear();
      router.push("/checkout/success");
    } catch {
      setErrors({
        submit:
          "Tidak bisa menghubungi server. Pesanan belum tercatat — periksa koneksi lalu coba lagi.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return <div className="mx-auto max-w-(--container-content) px-4 py-16 md:px-6" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-(--container-content) flex-col items-center gap-4 px-4 py-20 text-center md:px-6">
        <h1 className="text-xl font-semibold text-ink">Keranjang Anda kosong</h1>
        <p className="text-sm text-muted">Tambahkan produk dulu sebelum checkout.</p>
        <Link
          href="/category"
          className="tap-target mt-2 inline-flex items-center rounded-full bg-karyalo-green px-6 py-3 text-sm font-semibold text-warm-white hover:opacity-90"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <h1 className="mb-6 text-2xl font-semibold text-ink">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-3">
        <div className="flex flex-col gap-6 md:col-span-2">
          {/* Alamat */}
          <section className="rounded-(--radius-card) border border-border p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Alamat Pengiriman</h2>
            <div className="flex flex-col gap-3">
              <Field
                label="Nama Penerima"
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                error={errors.name}
              />
              <Field
                label="Nomor Telepon"
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                error={errors.phone}
                type="tel"
              />
              <Field
                label="Alamat Lengkap"
                value={form.address}
                onChange={(v) => setForm((f) => ({ ...f, address: v }))}
                error={errors.address}
                textarea
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Kota"
                  value={form.city}
                  onChange={(v) => setForm((f) => ({ ...f, city: v }))}
                  error={errors.city}
                />
                <Field
                  label="Kode Pos"
                  value={form.postalCode}
                  onChange={(v) => setForm((f) => ({ ...f, postalCode: v }))}
                />
              </div>
            </div>
          </section>

          {/* Pengiriman */}
          <section className="rounded-(--radius-card) border border-border p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Metode Pengiriman</h2>
            <div className="flex flex-col gap-2">
              {SHIPPING_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`tap-target flex cursor-pointer items-center justify-between rounded-lg border px-4 text-sm ${
                    shipping === opt.id ? "border-deep-pine bg-soft-sage" : "border-border"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shipping === opt.id}
                      onChange={() => setShipping(opt.id)}
                    />
                    {opt.label}
                  </span>
                  <span className="text-ink">{formatRupiah(opt.cost)}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Pembayaran */}
          <section className="rounded-(--radius-card) border border-border p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Metode Pembayaran</h2>
            <div className="flex flex-col gap-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`tap-target flex cursor-pointer items-center gap-2 rounded-lg border px-4 text-sm ${
                    payment === opt.id ? "border-deep-pine bg-soft-sage" : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === opt.id}
                    onChange={() => setPayment(opt.id)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">
              Simulasi prototype — belum terhubung ke payment gateway sungguhan.
            </p>
          </section>
        </div>

        {/* Ringkasan */}
        <div className="h-fit rounded-(--radius-card) border border-border p-5">
          <p className="mb-3 text-sm font-medium text-ink">Ringkasan Pesanan</p>
          <div className="flex flex-col gap-2 text-sm">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-muted">
                <span className="max-w-[70%] truncate">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-ink">{formatRupiah(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="text-ink">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Ongkos Kirim</span>
              <span className="text-ink">{formatRupiah(shippingCost)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatRupiah(total)}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="tap-target mt-4 flex w-full items-center justify-center rounded-full bg-karyalo-green px-6 py-3 text-sm font-semibold text-warm-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Memproses..." : "Buat Pesanan"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`rounded-lg border bg-warm-white px-3 py-2 text-sm text-ink focus:outline-none ${
            error ? "border-terracotta" : "border-border focus:border-deep-pine"
          }`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-11 rounded-lg border bg-warm-white px-3 text-sm text-ink focus:outline-none ${
            error ? "border-terracotta" : "border-border focus:border-deep-pine"
          }`}
        />
      )}
      {error && <span className="text-xs text-terracotta">{error}</span>}
    </label>
  );
}
