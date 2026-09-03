import { SampleDataBanner } from "@/components/system/SampleDataBanner";
import { SettingsSubNav } from "@/components/settings/SettingsSubNav";
import { Truck, CheckCircle2 } from "lucide-react";

const OPTIONS = [
  { name: "SPX Express Standard", eta: "2–3 hari", cost: "Rp 10.000", courier: "Shopee Xpress" },
  { name: "Reguler J&T / SiCepat", eta: "3–5 hari", cost: "Rp 15.000", courier: "Logistik Nasional" },
  { name: "Express / Next Day", eta: "1–2 hari", cost: "Rp 35.000", courier: "Prioritas Cepat" },
];

/** PRD §19.2 Shipping and Payment Configuration. */
// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default function ShippingSettingsPage() {
  return (
    <div className="mx-auto max-w-(--container-content) px-3.5 py-5 pb-24 sm:px-6 sm:py-8 sm:pb-12">
      {/* Sub-Navigasi Pengaturan Mobile & Desktop */}
      <SettingsSubNav />

      <div className="mb-4 flex items-center gap-2">
        <Truck size={22} className="text-karyalo-green" aria-hidden="true" />
        <h1 className="text-lg font-bold text-ink sm:text-2xl">Pengaturan Jasa Kirim & Ekspedisi</h1>
      </div>

      <SampleDataBanner note="Integrasi tarif otomatis kurir multi-ekspedisi terhubung dengan Shopee OpenAPI dan checkout webstore." />

      <div className="mt-5 flex flex-col gap-3 max-w-xl">
        {OPTIONS.map((o) => (
          <div
            key={o.name}
            className="flex items-center justify-between rounded-2xl border border-border bg-warm-white p-4 shadow-2xs hover:border-karyalo-green transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-soft-sage text-karyalo-green">
                <Truck size={16} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink">{o.name}</p>
                <p className="text-xs text-muted font-mono">{o.courier} • Estimasi {o.eta}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-xs font-bold text-ink">{o.cost}</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-status-success">
                <CheckCircle2 size={11} />
                Aktif
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
