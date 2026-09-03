import { getAuditLog } from "@/lib/data/team";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";
import { SettingsSubNav } from "@/components/settings/SettingsSubNav";
import { FileText, CheckCircle2, XCircle } from "lucide-react";

/** PRD §21 Audit Log — actor, timestamp, result untuk aksi sensitif. */
// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const entries = await getAuditLog();

  return (
    <div className="mx-auto max-w-(--container-wide) px-3.5 py-5 pb-24 sm:px-6 sm:py-8 sm:pb-12">
      {/* Sub-Navigasi Pengaturan Mobile & Desktop */}
      <SettingsSubNav />

      <div className="mb-4 flex items-center gap-2">
        <FileText size={22} className="text-karyalo-green" aria-hidden="true" />
        <h1 className="text-lg font-bold text-ink sm:text-2xl">Audit Log & Riwayat Aktivitas</h1>
      </div>

      <SampleDataBanner note="Mencatat seluruh aksi mutasi inventori, perubahan status order, dan login staf secara tamper-evident." />

      {/* Desktop Table View */}
      <div className="mt-5 hidden overflow-hidden rounded-2xl border border-border bg-warm-white shadow-2xs sm:block">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-soft-sand text-muted">
            <tr>
              <th className="px-4 py-3.5 font-semibold text-ink">Aktor / Staf</th>
              <th className="px-4 py-3.5 font-semibold text-ink">Aksi</th>
              <th className="px-4 py-3.5 font-semibold text-ink">Resource / Objek</th>
              <th className="px-4 py-3.5 font-semibold text-ink">Status Hasil</th>
              <th className="px-4 py-3.5 text-right font-semibold text-ink">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((e) => (
              <tr key={e.id} className="hover:bg-soft-sand/30 transition-colors">
                <td className="px-4 py-3.5 font-semibold text-ink">{e.actor}</td>
                <td className="px-4 py-3.5 text-ink">{e.action}</td>
                <td className="px-4 py-3.5 font-mono text-xs text-muted">{e.resource}</td>
                <td className="px-4 py-3.5">
                  {e.result === "success" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-status-success">
                      <CheckCircle2 size={12} />
                      Berhasil
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-status-critical">
                      <XCircle size={12} />
                      Gagal
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-xs text-muted">{e.timestampLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="mt-4 flex flex-col gap-2.5 sm:hidden">
        {entries.map((e) => (
          <div key={e.id} className="rounded-2xl border border-border bg-warm-white p-3.5 shadow-2xs text-xs">
            <div className="flex items-start justify-between gap-2">
              <span className="font-bold text-ink">{e.actor}</span>
              {e.result === "success" ? (
                <span className="inline-flex items-center gap-1 font-semibold text-status-success">
                  <CheckCircle2 size={12} />
                  Berhasil
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-status-critical">
                  <XCircle size={12} />
                  Gagal
                </span>
              )}
            </div>
            <p className="mt-1 text-ink">{e.action}</p>
            <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2 text-xs text-muted">
              <span className="font-mono">{e.resource}</span>
              <span className="font-mono">{e.timestampLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
