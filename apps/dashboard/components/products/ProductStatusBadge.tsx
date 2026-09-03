import { ProductStatus } from "@/lib/data/catalog";

const LABEL: Record<ProductStatus, string> = {
  published: "Aktif",
  draft: "Draft",
  archived: "Arsip",
};

const STYLES: Record<ProductStatus, { bg: string; dot: string }> = {
  published: { bg: "bg-soft-sage text-status-success", dot: "bg-status-success" },
  draft: { bg: "bg-soft-sand text-muted", dot: "bg-muted" },
  archived: { bg: "bg-terracotta-soft/70 text-status-warning", dot: "bg-status-warning" },
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const style = STYLES[status] ?? { bg: "bg-soft-sand text-muted", dot: "bg-muted" };

  return (
    <span className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.bg}`}>
      <span className={`size-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {LABEL[status]}
    </span>
  );
}
