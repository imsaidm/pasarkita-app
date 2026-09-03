import Link from "next/link";
import { AdminOrder } from "@/lib/data/orders";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { ChannelBadge } from "./ChannelBadge";
import { formatRupiah } from "@/lib/utils/currency";
import { ChevronRight, Truck, User, Calendar } from "lucide-react";

/**
 * PRD §14.2 Order List — Responsif Mobile (Full-width Vertical Cards, Zero Overflow) & Desktop (Table View).
 */
export function OrderList({ orders }: { orders: AdminOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-dashed border-border bg-soft-sand p-8 text-center text-sm text-muted">
        Tidak ada order pada tampilan ini.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full">
      {/* Mobile Full-width Vertical Card List (md:hidden) */}
      <div className="flex w-full min-w-0 max-w-full flex-col gap-3.5 md:hidden">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="group box-border flex w-full min-w-0 max-w-full flex-col gap-3 rounded-2xl border border-border bg-warm-white p-4 shadow-xs transition-all hover:border-karyalo-green/40 active:scale-[0.99]"
          >
            {/* Row 1: Order ID + Channel Badge & Status Badge */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-sm text-ink truncate transition-colors group-hover:text-karyalo-green">
                    {order.orderNumber}
                  </span>
                  <ChannelBadge channel={order.channel} />
                </div>
                {order.channelOrderNumber && (
                  <span className="font-mono text-xs text-muted truncate">
                    Shopee: {order.channelOrderNumber}
                  </span>
                )}
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            {/* Row 2: Customer & Date Info */}
            <div className="flex flex-col gap-1 rounded-xl bg-soft-sand/50 p-2.5 text-xs min-w-0">
              <div className="flex items-center justify-between text-ink min-w-0">
                <div className="flex items-center gap-1.5 font-medium truncate">
                  <User size={13} className="text-muted shrink-0" aria-hidden="true" />
                  <span className="truncate">{order.customerName}</span>
                  <span className="text-muted shrink-0">({order.city})</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Calendar size={12} className="shrink-0" aria-hidden="true" />
                <span className="truncate">{order.createdAtLabel}</span>
              </div>
            </div>

            {/* Row 3: Courier & Tracking */}
            <div className="flex items-center justify-between gap-2 text-xs min-w-0">
              <div className="flex items-center gap-1.5 text-muted min-w-0 truncate">
                <Truck size={13} className="text-karyalo-green shrink-0" aria-hidden="true" />
                <span className="font-medium text-ink truncate">{order.shippingLabel}</span>
              </div>
              {order.trackingNumber ? (
                <code className="rounded bg-soft-sand px-1.5 py-0.5 font-mono text-xs text-muted shrink-0">
                  {order.trackingNumber}
                </code>
              ) : (
                <span className="text-xs text-muted/60 shrink-0">Belum ada resi</span>
              )}
            </div>

            {/* Row 4: Total & Details Action */}
            <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
              <div className="flex items-center gap-1 text-xs text-muted">
                <span>{order.items.length} produk</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Total:</span>
                <span className="text-base font-bold text-karyalo-green">
                  {formatRupiah(order.total)}
                </span>
                <div className="flex size-6 items-center justify-center rounded-full bg-soft-sand text-muted transition-colors group-hover:bg-soft-sage group-hover:text-karyalo-green">
                  <ChevronRight size={14} aria-hidden="true" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop Table View (hidden md:block) */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-warm-white shadow-xs md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-soft-sand text-xs font-medium text-muted">
              <tr>
                <th className="px-4 py-3.5">Order & Channel</th>
                <th className="px-4 py-3.5">Pelanggan & Lokasi</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Kurir / Resi</th>
                <th className="px-4 py-3.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-soft-sand/60">
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-semibold text-karyalo-green hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-karyalo-green"
                        >
                          {order.orderNumber}
                        </Link>
                        <ChannelBadge channel={order.channel} />
                      </div>
                      {order.channelOrderNumber && (
                        <span className="text-xs font-mono text-muted/80">
                          No. Shopee: {order.channelOrderNumber}
                        </span>
                      )}
                      <span className="text-xs text-muted">{order.createdAtLabel}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="font-medium text-ink">{order.customerName}</p>
                    <p className="text-xs text-muted">{order.city}</p>
                  </td>

                  <td className="px-4 py-3.5">
                    <OrderStatusBadge status={order.status} />
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="text-xs font-medium text-ink">{order.shippingLabel}</p>
                    {order.trackingNumber ? (
                      <span className="font-mono text-xs text-muted">
                        {order.trackingNumber}
                      </span>
                    ) : (
                      <span className="text-xs text-muted/60">Belum ada resi</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <span className="font-semibold text-ink">{formatRupiah(order.total)}</span>
                    <p className="text-xs text-muted">{order.items.length} produk</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
