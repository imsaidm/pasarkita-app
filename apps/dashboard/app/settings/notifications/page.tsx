import { SampleDataBanner } from "@/components/system/SampleDataBanner";
import { PushSubscribeButton } from "@/components/notifications/PushSubscribeButton";
import { SettingsSubNav } from "@/components/settings/SettingsSubNav";
import { Bell } from "lucide-react";

const PREFERENCES = [
  { label: "Masalah pembayaran pesanan", channel: "Push + In-app" },
  { label: "Peringatan stok menipis (< 5 unit)", channel: "In-app + Banner" },
  { label: "Sinkronisasi Shopee OpenAPI gagal", channel: "In-app + Alert" },
  { label: "Publish katalog produk gagal", channel: "In-app" },
];

// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default function NotificationSettingsPage() {
  return (
    <div className="mx-auto max-w-(--container-content) px-3.5 py-5 pb-24 sm:px-6 sm:py-8 sm:pb-12">
      {/* Sub-Navigasi Pengaturan Mobile & Desktop */}
      <SettingsSubNav />

      <div className="mb-4 flex items-center gap-2">
        <Bell size={22} className="text-karyalo-green" aria-hidden="true" />
        <h1 className="text-lg font-bold text-ink sm:text-2xl">Pengaturan Notifikasi & Alert</h1>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-warm-white p-5 shadow-2xs">
        <h2 className="mb-1 text-xs font-bold text-ink">Push Notification Order Baru (Web Push API)</h2>
        <p className="mb-3 text-xs text-muted">
          Aktifkan notifikasi browser & PWA real-time setiap kali pesanan baru masuk dari webstore atau Shopee.
        </p>
        <PushSubscribeButton />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-bold text-ink">Preferensi Notifikasi Sistem Lainnya</h2>
        <SampleDataBanner note="Preferensi saluran di bawah ini akan dihubungkan otomatis dengan webhook gateway." />
        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-warm-white shadow-2xs">
          {PREFERENCES.map((p) => (
            <div key={p.label} className="flex items-center justify-between px-4 py-3.5 text-xs">
              <span className="font-semibold text-ink">{p.label}</span>
              <span className="font-mono text-muted">{p.channel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
