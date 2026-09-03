import { SampleDataBanner } from "@/components/system/SampleDataBanner";
import { SettingsSubNav } from "@/components/settings/SettingsSubNav";
import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";

const METHODS = [
  { name: "Transfer Bank Otomatis (VA BCA/Mandiri/BRI/BNI)", status: "Aktif", type: "Virtual Account" },
  { name: "QRIS & E-Wallet (GoPay, OVO, ShopeePay)", status: "Aktif", type: "Instant Settlement" },
  { name: "Shopee Marketplace Saldo Penjual", status: "Terhubung", type: "Shopee OpenAPI Payout" },
  { name: "DOKU Payment Gateway", status: "Belum Terhubung", type: "Gateway Eksternal" },
];

// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default function PaymentSettingsPage() {
  return (
    <div className="mx-auto max-w-(--container-content) px-3.5 py-5 pb-24 sm:px-6 sm:py-8 sm:pb-12">
      {/* Sub-Navigasi Pengaturan Mobile & Desktop */}
      <SettingsSubNav />

      <div className="mb-4 flex items-center gap-2">
        <CreditCard size={22} className="text-karyalo-green" aria-hidden="true" />
        <h1 className="text-lg font-bold text-ink sm:text-2xl">Rekening & Metode Pembayaran</h1>
      </div>

      <SampleDataBanner note="Karyalo Manage mematuhi standar PCI-DSS: seluruh penarikan dana dan rekening pembayaran diproses aman tanpa menyimpan PAN sensitif." />

      <div className="mt-5 flex flex-col gap-3 max-w-xl">
        {METHODS.map((m) => (
          <div
            key={m.name}
            className="flex items-center justify-between rounded-2xl border border-border bg-warm-white p-4 shadow-2xs hover:border-karyalo-green transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-soft-sage text-karyalo-green">
                <CreditCard size={16} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink">{m.name}</p>
                <p className="text-xs text-muted font-mono">{m.type}</p>
              </div>
            </div>
            <div>
              {m.status === "Aktif" || m.status === "Terhubung" ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-soft-sage px-2 py-0.5 text-xs font-semibold text-status-success">
                  <CheckCircle2 size={11} />
                  {m.status}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-soft-sand px-2 py-0.5 text-xs font-medium text-muted">
                  <AlertCircle size={11} />
                  {m.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
