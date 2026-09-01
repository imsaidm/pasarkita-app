"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { CartItem } from "@/lib/cart/cart-context";
import { formatRupiah } from "@/lib/utils/currency";

interface LastOrder {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingLabel?: string;
  paymentLabel?: string;
  recipientName?: string;
}

/**
 * §22 Order Success. Membaca `sessionStorage.karyalo.lastOrder` yang
 * dititipkan oleh /checkout saat submit (lihat catatan lengkap soal ini
 * di app/checkout/page.tsx — bukan authoritative order store, murni
 * state UI sementara antar-halaman). Kalau kosong (mis. user buka
 * halaman ini langsung tanpa checkout), tampilkan pesan generik.
 */
export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("karyalo.lastOrder");
      if (raw) setOrder(JSON.parse(raw));
    } catch {
      // abaikan — tampilkan pesan generik
    } finally {
      setChecked(true);
    }
  }, []);

  if (!checked) {
    return <div className="mx-auto max-w-(--container-content) px-4 py-16 md:px-6" />;
  }

  return (
    <div className="mx-auto flex max-w-(--container-content) flex-col items-center gap-3 px-4 py-16 text-center md:px-6">
      <CheckCircle2 size={48} strokeWidth={1.4} className="text-karyalo-green" aria-hidden="true" />
      <h1 className="text-2xl font-semibold text-ink">Pesanan Berhasil Dibuat</h1>
      {order ? (
        <>
          <p className="text-sm text-muted">
            Nomor pesanan <span className="font-semibold text-ink">{order.orderNumber}</span>
            {order.recipientName ? ` — atas nama ${order.recipientName}` : ""}
          </p>

          <div className="mt-4 w-full max-w-md rounded-(--radius-card) border border-border p-5 text-left">
            <div className="flex flex-col gap-2 text-sm">
              {order.items.map((item) => (
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
                <span>Pengiriman</span>
                <span className="text-ink">{order.shippingLabel}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Pembayaran</span>
                <span className="text-ink">{order.paymentLabel}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-ink">
                <span>Total</span>
                <span>{formatRupiah(order.total)}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="max-w-sm text-sm text-muted">
          Terima kasih telah berbelanja di Karyalo. Anda akan menerima
          konfirmasi pesanan lebih lanjut.
        </p>
      )}

      <p className="mt-2 max-w-sm text-xs text-muted">
        Ini simulasi prototype — belum ada notifikasi email/WhatsApp
        sungguhan (Resend belum terhubung) dan status pesanan tidak
        tersimpan permanen di server.
      </p>

      <div className="mt-4 flex gap-3">
        <Link
          href="/category"
          className="tap-target inline-flex items-center rounded-full bg-karyalo-green px-6 py-3 text-sm font-semibold text-warm-white hover:opacity-90"
        >
          Lanjut Belanja
        </Link>
        <Link
          href="/account/orders"
          className="tap-target inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-ink hover:border-deep-pine"
        >
          Lihat Pesanan
        </Link>
      </div>
    </div>
  );
}
