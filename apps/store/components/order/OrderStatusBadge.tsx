import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/data/order-status";

const STYLES: Record<OrderStatus, string> = {
  diproses: "bg-soft-sage text-deep-pine",
  dikirim: "bg-accent-cyan/25 text-deep-pine",
  selesai: "bg-karyalo-green/15 text-karyalo-green",
  dibatalkan: "bg-terracotta-soft text-terracotta",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status]}`}>
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
