import { notFound } from "next/navigation";
import { getPromotionById, getPromotions, PROMOTION_TYPE_LABEL } from "@/lib/data/marketing";
import { PromotionStatusBadge } from "@/components/marketing/PromotionStatusBadge";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";


/** PRD §13 — detail promosi + eligibility rule (§39 `EligibilityRuleBuilder`, belum dibangun). */
// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ promotionId: string }>;
}) {
  const { promotionId } = await params;
  const promotion = await getPromotionById(promotionId);
  if (!promotion) notFound();

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-6 md:px-6 md:py-8">
      <div className="mb-1 flex items-center gap-2">
        <h1 className="text-xl font-semibold text-ink md:text-2xl">{promotion.name}</h1>
        <PromotionStatusBadge status={promotion.status} />
      </div>
      <p className="mb-4 text-sm text-muted">{PROMOTION_TYPE_LABEL[promotion.type]} · {promotion.periodLabel}</p>
      <SampleDataBanner note="Eligibility rule builder belum dibangun (Fase 3)." />
      <div className="rounded-(--radius-card) border border-border bg-warm-white p-4">
        <p className="text-sm text-ink">Nilai: <span className="font-medium">{promotion.value}</span></p>
      </div>
    </div>
  );
}
