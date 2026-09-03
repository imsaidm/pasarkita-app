import { SampleDataBanner } from "@/components/system/SampleDataBanner";
import { SettingsSubNav } from "@/components/settings/SettingsSubNav";
import { Store, Save } from "lucide-react";

/** PRD §19.1 Store Settings. */
// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default function StoreSettingsPage() {
  return (
    <div className="mx-auto max-w-(--container-content) px-3.5 py-5 pb-24 sm:px-6 sm:py-8 sm:pb-12">
      {/* Sub-Navigasi Pengaturan Mobile & Desktop */}
      <SettingsSubNav />

      <div className="mb-4 flex items-center gap-2">
        <Store size={22} className="text-karyalo-green" aria-hidden="true" />
        <h1 className="text-lg font-bold text-ink sm:text-2xl">Pengaturan Informasi Toko</h1>
      </div>

      <SampleDataBanner />

      <div className="mt-5 max-w-xl rounded-2xl border border-border bg-warm-white p-5 shadow-2xs flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink">Nama Toko</label>
          <input
            defaultValue="Karyalo Store (Demo)"
            className="w-full rounded-xl border border-border bg-warm-white px-3.5 py-2.5 text-xs text-ink focus:border-karyalo-green focus:outline-hidden focus-visible:ring-1 focus-visible:ring-karyalo-green"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink">Mata Uang Default</label>
            <input
              defaultValue="IDR (Rp - Rupiah)"
              disabled
              className="w-full rounded-xl border border-border bg-soft-sand px-3.5 py-2.5 text-xs text-muted cursor-not-allowed"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink">Zona Waktu Operasional</label>
            <input
              defaultValue="WIB (UTC+7 - Jakarta)"
              disabled
              className="w-full rounded-xl border border-border bg-soft-sand px-3.5 py-2.5 text-xs text-muted cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            className="tap-target inline-flex items-center gap-1.5 rounded-xl bg-deep-pine px-4 py-2 text-xs font-semibold text-warm-white hover:bg-karyalo-green transition-colors shadow-2xs"
          >
            <Save size={14} aria-hidden="true" />
            <span>Simpan Pengaturan Toko</span>
          </button>
        </div>
      </div>
    </div>
  );
}
