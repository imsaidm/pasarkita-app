import { Radio } from "lucide-react";

/**
 * Kebalikan `SampleDataBanner` — dipakai halaman yang isinya BUKAN mock,
 * BARU 16 Agustus 2026 untuk `/orders/live/[orderId]`, satu-satunya
 * halaman di Manage yang membaca data sungguhan (order asli dari checkout
 * storefront lewat backend Convex bersama). Perlu penanda eksplisit
 * jenis lain juga — kalau tidak, halaman ini bisa disalahartikan
 * "cuma mock lagi seperti halaman lain" padahal sebaliknya.
 */
export function LiveDataBanner({ note }: { note?: string }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-dashed border-status-success bg-soft-sage px-3.5 py-2.5 text-xs text-deep-pine">
      <Radio size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>
        <strong className="font-semibold">Data sungguhan</strong> — order ini benar-benar
        dibuat lewat checkout storefront, dibaca langsung dari Convex, bukan data contoh.
        {note ? ` ${note}` : ""}
      </span>
    </div>
  );
}
