import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getPromotions, getCampaigns } from "@/lib/data/marketing";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";

/** PRD §13 Marketing/Promotion UI — ringkasan. */
// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function MarketingOverviewPage() {
  const [promotions, campaigns] = await Promise.all([getPromotions(), getCampaigns()]);
  const activeCount = promotions.filter((p) => p.status === "active").length;

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-6 md:px-6 md:py-8">
      <h1 className="mb-1 text-xl font-semibold text-ink md:text-2xl">Marketing</h1>
      <p className="mb-4 text-sm text-muted">{activeCount} promosi aktif · {campaigns.length} kampanye</p>
      <SampleDataBanner />
      <div className="flex flex-col divide-y divide-border rounded-(--radius-card) border border-border bg-warm-white">
        <Link href="/marketing/promotions" className="tap-target flex items-center justify-between px-5 py-4 text-sm text-ink hover:bg-soft-sand">
          Promosi
          <ChevronRight size={16} className="text-muted" aria-hidden="true" />
        </Link>
        <Link href="/marketing/campaigns" className="tap-target flex items-center justify-between px-5 py-4 text-sm text-ink hover:bg-soft-sand">
          Kampanye
          <ChevronRight size={16} className="text-muted" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
