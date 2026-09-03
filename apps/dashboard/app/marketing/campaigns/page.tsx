import { getCampaigns } from "@/lib/data/marketing";
import { PromotionStatusBadge } from "@/components/marketing/PromotionStatusBadge";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";

/** PRD §13 — penempatan kampanye di storefront. */
// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-6 md:px-6 md:py-8">
      <h1 className="mb-4 text-xl font-semibold text-ink md:text-2xl">Kampanye</h1>
      <SampleDataBanner />
      <div className="flex flex-col gap-2">
        {campaigns.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3 rounded-(--radius-card) border border-border bg-warm-white p-4">
            <div>
              <p className="text-sm font-medium text-ink">{c.name}</p>
              <p className="text-xs text-muted">{c.placement} · {c.periodLabel}</p>
            </div>
            <PromotionStatusBadge status={c.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
