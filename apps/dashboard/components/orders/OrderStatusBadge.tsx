import { OrderStatus, ORDER_STATUS_LABEL } from "@/lib/data/orders";

const STYLES: Record<OrderStatus, { bg: string; dot: string }> = {
  new: { bg: "bg-soft-sage text-deep-pine", dot: "bg-karyalo-green" },
  payment_issue: { bg: "bg-terracotta-soft/70 text-status-critical", dot: "bg-status-critical" },
  processing: { bg: "bg-soft-sage text-deep-pine", dot: "bg-accent-cyan" },
  fulfillment: { bg: "bg-terracotta-soft/60 text-status-warning", dot: "bg-status-warning" },
  shipped: { bg: "bg-soft-sand text-ink", dot: "bg-muted" },
  completed: { bg: "bg-soft-sage text-status-success", dot: "bg-status-success" },
  cancelled: { bg: "bg-soft-sand text-muted", dot: "bg-muted/60" },
  return_refund: { bg: "bg-terracotta-soft/80 text-status-warning", dot: "bg-status-warning" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const style = STYLES[status] ?? { bg: "bg-soft-sand text-muted", dot: "bg-muted" };

  return (
    <span className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.bg}`}>
      <span className={`size-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
