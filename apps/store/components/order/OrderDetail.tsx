import Image from "next/image";
import { CheckCircle2, Circle } from "lucide-react";
import { Order, OrderStatus } from "@/lib/data/orders";
import { formatRupiah } from "@/lib/utils/currency";
import { OrderStatusBadge } from "./OrderStatusBadge";

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "diproses", label: "Diproses" },
  { key: "dikirim", label: "Dikirim" },
  { key: "selesai", label: "Selesai" },
];

/**
 * §23 Order Tracking + §24 Account/Orders detail — komponen dipakai
 * bersama oleh /order/[id] dan /account/orders/[id] (dua rute PRD §47
 * yang isinya sama persis, cuma konteks navigasinya beda).
 */
export function OrderDetail({ order }: { order: Order }) {
  const currentIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-muted">Nomor Pesanan</p>
          <p className="text-lg font-semibold text-ink">{order.orderNumber}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.status !== "dibatalkan" && (
        <div className="flex items-center gap-2 rounded-(--radius-card) border border-border p-5">
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex flex-1 items-center gap-2">
              <div className="flex flex-col items-center gap-1.5">
                {i <= currentIndex ? (
                  <CheckCircle2 size={22} className="text-karyalo-green" aria-hidden="true" />
                ) : (
                  <Circle size={22} className="text-border" aria-hidden="true" />
                )}
                <span className={`text-[11px] ${i <= currentIndex ? "text-ink" : "text-muted"}`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${i < currentIndex ? "bg-karyalo-green" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-(--radius-card) border border-border p-5">
        <p className="mb-3 text-sm font-medium text-ink">Item Pesanan</p>
        <div className="flex flex-col gap-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-soft-sand">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.name} fill sizes="56px" className="object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <p className="text-sm text-ink">{item.name}</p>
                {item.variantLabel && <p className="text-xs text-muted">{item.variantLabel}</p>}
                <p className="text-xs text-muted">
                  {item.quantity} × {formatRupiah(item.unitPrice)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span className="text-ink">{formatRupiah(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Ongkos Kirim ({order.shippingLabel})</span>
            <span className="text-ink">{formatRupiah(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-ink">
            <span>Total</span>
            <span>{formatRupiah(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-(--radius-card) border border-border p-5 text-sm">
        <p className="mb-2 font-medium text-ink">Dikirim ke</p>
        <p className="text-muted">{order.recipientName}</p>
        <p className="text-muted">{order.address}</p>
        <p className="mt-3 text-muted">
          Pembayaran: <span className="text-ink">{order.paymentLabel}</span>
        </p>
      </div>
    </div>
  );
}
