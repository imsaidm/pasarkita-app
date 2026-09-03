import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck, CreditCard } from "lucide-react";
import { getOrderById, getAllOrders } from "@/lib/data/orders";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { ChannelBadge } from "@/components/orders/ChannelBadge";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { OrderCommandBar } from "@/components/orders/OrderCommandBar";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";
import { formatRupiah } from "@/lib/utils/currency";


/** PRD §14.3 Order Detail — Responsif Mobile & Desktop. */
// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order) notFound();

  return (
    <div className="mx-auto flex max-w-(--container-content) flex-col gap-5 px-3.5 py-5 sm:px-6 sm:py-8">
      <div className="flex items-center gap-2">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Kembali ke Daftar Order</span>
        </Link>
      </div>

      <SampleDataBanner />

      {/* Header Order */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-warm-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-ink sm:text-2xl">{order.orderNumber}</h1>
            <ChannelBadge channel={order.channel} />
          </div>
          {order.channelOrderNumber && (
            <span className="font-mono text-xs text-muted">
              No. Pesanan Shopee: <strong>{order.channelOrderNumber}</strong>
            </span>
          )}
          <p className="text-xs text-muted">
            {order.customerName} • {order.city} · {order.createdAtLabel}
          </p>
        </div>
        <div className="self-start sm:self-center">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <OrderCommandBar />

      <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-5">
          {/* Item Order */}
          <section className="rounded-(--radius-card) border border-border bg-warm-white p-4 shadow-xs">
            <h2 className="mb-3 text-sm font-semibold text-ink">Item Order ({order.items.length} Produk)</h2>
            <div className="flex flex-col divide-y divide-border">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.productName}</p>
                    <p className="text-xs text-muted">
                      SKU: <span className="font-mono">{item.sku}</span>
                      {item.variantLabel ? ` · Varian: ${item.variantLabel}` : ""}
                    </p>
                    <p className="text-xs text-ink/80 mt-0.5">{item.quantity} × {formatRupiah(item.unitPrice)}</p>
                  </div>
                  <span className="text-sm font-bold text-ink">{formatRupiah(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3 text-xs sm:text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal Produk</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Biaya Pengiriman ({order.shippingLabel})</span>
                <span>{formatRupiah(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 text-base font-bold text-ink">
                <span>Total Pembayaran</span>
                <span className="text-karyalo-green">{formatRupiah(order.total)}</span>
              </div>
            </div>
          </section>

          {/* Fulfillment Timeline */}
          <section className="rounded-(--radius-card) border border-border bg-warm-white p-4 shadow-xs">
            <h2 className="mb-3 text-sm font-semibold text-ink">Timeline Pemrosesan & Logistik</h2>
            <OrderTimeline status={order.status} />
          </section>
        </div>

        <div className="flex flex-col gap-4">
          {/* Info Pembayaran */}
          <section className="rounded-(--radius-card) border border-border bg-warm-white p-4 shadow-xs">
            <div className="flex items-center gap-2 text-deep-pine mb-2">
              <CreditCard size={16} aria-hidden="true" />
              <h2 className="text-sm font-semibold text-ink">Metode Pembayaran</h2>
            </div>
            <p className="text-xs font-medium text-ink">{order.paymentLabel}</p>
          </section>

          {/* Info Pengiriman & Resi */}
          <section className="rounded-(--radius-card) border border-border bg-warm-white p-4 shadow-xs">
            <div className="flex items-center gap-2 text-deep-pine mb-2">
              <Truck size={16} aria-hidden="true" />
              <h2 className="text-sm font-semibold text-ink">Informasi Pengiriman</h2>
            </div>
            <p className="text-xs font-semibold text-ink">{order.shippingLabel}</p>
            {order.trackingNumber ? (
              <div className="mt-2 rounded-lg bg-soft-sand p-2.5">
                <span className="text-xs text-muted block">Nomor Resi Pelacakan:</span>
                <code className="font-mono text-xs font-bold text-karyalo-green select-all">
                  {order.trackingNumber}
                </code>
              </div>
            ) : (
              <p className="mt-1 text-xs text-muted">Belum ada nomor resi diterbitkan.</p>
            )}
            <p className="mt-2 text-xs text-muted">Tujuan: <strong>{order.city}</strong></p>
          </section>
        </div>
      </div>
    </div>
  );
}
