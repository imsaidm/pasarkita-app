import { PromotionStatus } from "@/lib/data/marketing";

const LABEL: Record<PromotionStatus, string> = {
  active: "Aktif",
  scheduled: "Terjadwal",
  ended: "Selesai",
  draft: "Draft",
};

const STYLES: Record<PromotionStatus, string> = {
  active: "bg-soft-sage text-status-success",
  scheduled: "bg-terracotta-soft text-status-info",
  ended: "bg-soft-sand text-muted",
  draft: "bg-soft-sand text-muted",
};

export function PromotionStatusBadge({ status }: { status: PromotionStatus }) {
  return (
    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}>
      {LABEL[status]}
    </span>
  );
}
