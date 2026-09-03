import { OrderChannel } from "@/lib/data/orders";

export function ChannelBadge({ channel }: { channel: OrderChannel }) {
  switch (channel) {
    case "shopee":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#ee4d2d]/10 px-1.5 py-0.5 text-xs font-semibold text-[#ee4d2d]">
          <span className="size-1.5 rounded-full bg-[#ee4d2d]" aria-hidden="true" />
          Shopee
        </span>
      );
    case "storefront":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-karyalo-green/10 px-1.5 py-0.5 text-xs font-semibold text-karyalo-green">
          <span className="size-1.5 rounded-full bg-karyalo-green" aria-hidden="true" />
          Web Store
        </span>
      );
    case "manual":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-soft-sand px-1.5 py-0.5 text-xs font-semibold text-muted">
          <span className="size-1.5 rounded-full bg-muted" aria-hidden="true" />
          POS / Manual
        </span>
      );
  }
}
