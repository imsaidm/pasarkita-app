import { SampleDataBanner } from "@/components/system/SampleDataBanner";

/**
 * PRD §18 Analytics. Metrik contoh di bawah statis (bukan dihitung dari
 * `lib/data/orders.ts`) supaya tidak menciptakan kesan konsistensi
 * matematis yang menyesatkan antar-modul — angka ini murni ilustrasi
 * layout, ditandai jelas via `SampleDataBanner`.
 */
const METRICS = [
  { label: "Pengunjung (30 hari)", value: "—", note: "Butuh Analytics event pipeline" },
  { label: "Conversion Rate", value: "—", note: "Butuh denominator storefront (§10.1)" },
  { label: "Produk Terlaris", value: "—", note: "Butuh agregasi order sungguhan" },
  { label: "Sumber Traffic", value: "—", note: "Butuh Analytics event pipeline" },
];

// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-(--container-wide) px-4 py-6 md:px-6 md:py-8">
      <h1 className="mb-4 text-xl font-semibold text-ink md:text-2xl">Analytics</h1>
      <SampleDataBanner note="Sama seperti Dashboard, metrik sales/behavior TIDAK dikarang (§37 Coding Rule 21) — ditampilkan kosong sampai Analytics pipeline ada." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.label} className="rounded-(--radius-card) border border-border bg-warm-white p-4">
            <p className="text-xs font-medium text-muted">{m.label}</p>
            <p className="mt-1 text-lg font-semibold text-ink/40">{m.value}</p>
            <p className="mt-1 text-xs text-muted">{m.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
