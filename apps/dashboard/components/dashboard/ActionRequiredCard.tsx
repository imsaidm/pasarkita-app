import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

/**
 * ActionRequiredCard — Polished & Accessible Empty State.
 */
export function ActionRequiredCard() {
  return (
    <div
      className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-warm-white p-4 sm:p-5 shadow-xs transition-colors sm:flex-row sm:items-center"
      role="region"
      aria-label="Status Tindakan Diperlukan"
    >
      <div className="flex items-start gap-3.5">
        <div
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-soft-sand text-muted"
          aria-hidden="true"
        >
          <CheckCircle2 size={20} className="text-karyalo-green" />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">Semua pesanan & modul terkendali</h3>
            <span className="rounded-full bg-soft-sand px-2 py-0.5 text-xs font-medium text-muted">
              Sistem Aktif
            </span>
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-muted">
            Tidak ada isu mendesak. Pesanan baru dari Shopee & Web Store otomatis masuk ke antrean pipeline fulfillment.
          </p>
        </div>
      </div>

      <Link
        href="/orders"
        className="tap-target inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-soft-sand/60 px-3.5 py-2 text-xs font-semibold text-ink hover:bg-soft-sage hover:text-karyalo-green focus:outline-none focus-visible:ring-2 focus-visible:ring-karyalo-green sm:self-center"
        aria-label="Buka Daftar Pesanan Toko"
      >
        <span>Lihat Semua Pesanan</span>
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}
