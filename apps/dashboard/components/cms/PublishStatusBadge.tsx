import { PublishStatus } from "@/lib/data/cms";

const LABEL: Record<PublishStatus, string> = {
  published: "Published",
  draft: "Draft",
  scheduled: "Terjadwal",
};

const STYLES: Record<PublishStatus, string> = {
  published: "bg-soft-sage text-status-success",
  draft: "bg-soft-sand text-muted",
  scheduled: "bg-terracotta-soft text-status-info",
};

export function PublishStatusBadge({ status }: { status: PublishStatus }) {
  return (
    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}>
      {LABEL[status]}
    </span>
  );
}
