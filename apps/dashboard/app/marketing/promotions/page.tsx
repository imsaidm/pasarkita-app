import Link from "next/link";
import { getPromotions, PROMOTION_TYPE_LABEL } from "@/lib/data/marketing";
import { PromotionStatusBadge } from "@/components/marketing/PromotionStatusBadge";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";
import { PermissionGate } from "@/components/system/PermissionGate";

/** PRD §13 — diskon, voucher, flash sale, bundle, free shipping. */
// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const promotions = await getPromotions();

  return (
    <div className="mx-auto max-w-(--container-wide) px-4 py-6 md:px-6 md:py-8">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-ink md:text-2xl">Promosi</h1>
        <PermissionGate capability="promotionWrite">
          <button className="tap-target rounded-full bg-karyalo-green px-4 py-2 text-xs font-medium text-warm-white hover:opacity-90">
            Buat Promosi
          </button>
        </PermissionGate>
      </div>
      <p className="mb-4 text-sm text-muted">{promotions.length} promosi</p>
      <SampleDataBanner />
      <div className="overflow-hidden rounded-(--radius-card) border border-border bg-warm-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-soft-sand text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Tipe</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Periode</th>
              <th className="px-4 py-3 text-right font-medium">Nilai</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {promotions.map((p) => (
              <tr key={p.id} className="hover:bg-soft-sand">
                <td className="px-4 py-3">
                  <Link href={`/marketing/promotions/${p.id}`} className="font-medium text-karyalo-green hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted sm:table-cell">{PROMOTION_TYPE_LABEL[p.type]}</td>
                <td className="px-4 py-3">
                  <PromotionStatusBadge status={p.status} />
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted md:table-cell">{p.periodLabel}</td>
                <td className="px-4 py-3 text-right text-ink">{p.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
