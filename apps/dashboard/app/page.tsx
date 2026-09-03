import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { OrderPipelineProgress } from "@/components/dashboard/OrderPipelineProgress";
import { ActionRequiredCard } from "@/components/dashboard/ActionRequiredCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { FeatureModulesGrid } from "@/components/dashboard/FeatureModulesGrid";
import { SalesSummarySection } from "@/components/dashboard/SalesSummarySection";

// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-(--container-wide) min-w-0 flex-col gap-6 px-3.5 py-5 sm:px-6 sm:py-8 box-border">
      {/* Header Halaman */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-deep-pine sm:text-2xl truncate">
            Dashboard Cockpit Toko
          </h1>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            Kendali operasional toko multi-channel: Web Storefront & Shopee Marketplace.
          </p>
        </div>
        <div className="mt-1 sm:mt-0 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ee4d2d]/10 px-3 py-1 text-xs font-semibold text-[#ee4d2d]">
            <ShoppingBag size={12} aria-hidden="true" />
            Shopee Partner Ready
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-soft-sand px-3 py-1 text-xs font-medium text-muted">
            <span className="size-2 rounded-full bg-status-success" aria-hidden="true" />
            Live Sync
          </span>
        </div>
      </header>

      {/* 1. Ringkasan Metrik Penjualan Aktif & Sinkronisasi Order */}
      <SalesSummarySection />

      {/* 2. Visual Pipeline Pemrosesan Pesanan Multi-Channel */}
      <section aria-labelledby="heading-order-pipeline" className="min-w-0">
        <OrderPipelineProgress />
      </section>

      {/* 3. Semua Modul & Fitur Operasional — Beradaptasi Berdasarkan Role Aktif */}
      <FeatureModulesGrid />

      {/* 4. Pusat Antrean Tindakan Cepat */}
      <section aria-labelledby="heading-action-required" className="flex flex-col gap-2.5 min-w-0">
        <h2 id="heading-action-required" className="text-xs font-semibold uppercase tracking-wider text-muted">
          Pusat Perhatian & Antrean Tindakan
        </h2>
        <ActionRequiredCard />
      </section>

      {/* 5. Pintasan Cepat Harian — Beradaptasi Berdasarkan Role Aktif */}
      <section aria-labelledby="heading-quick-actions" className="flex flex-col gap-2.5 min-w-0">
        <h2 id="heading-quick-actions" className="text-xs font-semibold uppercase tracking-wider text-muted">
          Pintasan Cepat
        </h2>
        <QuickActions />
      </section>
    </div>
  );
}
