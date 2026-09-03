import { FlaskConical } from "lucide-react";

/**
 * PRD §37 Codex Coding Rule 4: "Semua external/domain API dibungkus typed
 * adapter; mock isolated dan tidak masuk production path." Rule 21:
 * "Tidak boleh ada fake order, stock, sales, countdown, atau notification
 * production data." Data mock di bawah `lib/data/*.ts` DIPERBOLEHKAN untuk
 * keperluan review prototype (pemilik proyek eksplisit minta "mock dulu
 * kayak yg storefront", 16 Agustus 2026), TAPI setiap halaman yang
 * memakainya WAJIB menampilkan penanda ini secara jelas — supaya tidak
 * pernah bisa disalahartikan sebagai data produksi sungguhan oleh siapa
 * pun yang membuka prototype ini. Dashboard (`/`) SENGAJA TIDAK memakai
 * data mock apa pun (lihat MetricCard) — itu satu-satunya halaman yang
 * benar-benar dilarang PRD menampilkan angka sales/order/stock contoh.
 */
export function SampleDataBanner({ note }: { note?: string }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-dashed border-accent-cyan bg-soft-sage px-3.5 py-2.5 text-xs text-deep-pine">
      <FlaskConical size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>
        <strong className="font-semibold">Data contoh (demo)</strong> — bukan
        data produksi sungguhan, belum tersambung backend apa pun.
        {note ? ` ${note}` : ""}
      </span>
    </div>
  );
}
