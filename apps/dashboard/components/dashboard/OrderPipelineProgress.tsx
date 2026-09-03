import Link from "next/link";
import { Sparkles, Clock, PackageCheck, Truck, ChevronRight } from "lucide-react";

interface PipelineStage {
  id: string;
  label: string;
  count: number | string;
  hint: string;
  href: string;
  icon: typeof Sparkles;
  badge: string;
}

const STAGES: PipelineStage[] = [
  {
    id: "new",
    label: "1. Pesanan Baru",
    count: 2,
    hint: "Perlu konfirmasi",
    href: "/orders",
    icon: Sparkles,
    badge: "Baru",
  },
  {
    id: "payment",
    label: "2. Menunggu Bayar",
    count: 1,
    hint: "Konfirmasi tertunda",
    href: "/orders/payment-issues",
    icon: Clock,
    badge: "Menunggu",
  },
  {
    id: "processing",
    label: "3. Siap Dipacking",
    count: 2,
    hint: "Gudang / Packing",
    href: "/orders/fulfillment",
    icon: PackageCheck,
    badge: "Siap Kirim",
  },
  {
    id: "fulfillment",
    label: "4. Dikirim / Ekspedisi",
    count: 2,
    hint: "Resi SPX / J&T aktif",
    href: "/orders",
    icon: Truck,
    badge: "Kurir",
  },
];

/**
 * OrderPipelineProgress — Distilled & Unified Pipeline Stage.
 * Menggantikan 4 kartu terpisah menjadi 1 ringkasan alur fulfillment yang bersih dan interaktif.
 */
export function OrderPipelineProgress() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-warm-white p-4 shadow-xs sm:p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Pipeline Pemrosesan Pesanan
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Alur status pesanan harian dari masuk hingga diserahkan ke ekspedisi.
          </p>
        </div>
        <Link
          href="/orders"
          className="tap-target inline-flex items-center gap-1 text-xs font-semibold text-karyalo-green hover:underline"
        >
          <span>Semua Pesanan</span>
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          return (
            <Link
              key={stage.id}
              href={stage.href}
              className="group tap-target flex flex-col justify-between rounded-xl border border-border/80 bg-soft-sand/40 p-3.5 transition-all hover:border-karyalo-green/40 hover:bg-soft-sage/30 hover:shadow-xs active:scale-[0.98]"
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-xs font-semibold text-muted transition-colors group-hover:text-deep-pine truncate">
                  {stage.label}
                </span>
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-soft-sand text-muted group-hover:bg-soft-sage group-hover:text-karyalo-green">
                  <Icon size={13} aria-hidden="true" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-2">
                <span className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                  {stage.count}
                </span>
                <span className="rounded bg-warm-white px-1.5 py-0.5 text-xs font-medium text-muted shadow-xs">
                  {stage.badge}
                </span>
              </div>

              <span className="mt-1 text-xs text-muted truncate">
                {stage.hint}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
