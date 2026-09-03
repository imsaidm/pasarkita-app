import { CheckCircle2, Circle } from "lucide-react";
import { OrderStatus } from "@/lib/data/orders";

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "new", label: "Baru" },
  { key: "processing", label: "Diproses" },
  { key: "fulfillment", label: "Fulfillment" },
  { key: "shipped", label: "Dikirim" },
  { key: "completed", label: "Selesai" },
];

/** PRD §15 Order Lifecycle — timeline linear untuk status non-exception. */
export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled" || status === "payment_issue" || status === "return_refund") {
    return (
      <div className="rounded-(--radius-card) border border-dashed border-border bg-soft-sand p-4 text-sm text-muted">
        Order ini berada di jalur exception ({status === "cancelled" ? "dibatalkan" : status === "payment_issue" ? "masalah pembayaran" : "retur/refund"}) — timeline linear tidak berlaku, lihat §15 Order Lifecycle untuk state machine lengkap.
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <ol className="flex flex-col gap-3">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        return (
          <li key={step.key} className="flex items-center gap-3">
            {done ? (
              <CheckCircle2 size={18} className="text-status-success" aria-hidden="true" />
            ) : (
              <Circle size={18} className="text-border" aria-hidden="true" />
            )}
            <span className={`text-sm ${done ? "font-medium text-ink" : "text-muted"}`}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
