import { Construction } from "lucide-react";

/**
 * Placeholder untuk rute yang strukturnya sudah didefinisikan PRD §38
 * Suggested Routes, tapi kontennya adalah pekerjaan fase berikutnya
 * (§36 Codex Implementation Phases 2-7). Pola sama persis dengan
 * `RouteStub` di Karyalo_Storefront_PWA — Fase 1 di sini sengaja HANYA
 * membangun admin shell + routing + permission-gating, bukan fitur CMS/
 * catalog/order/dst. sungguhan.
 *
 * PENTING (§37 Codex Coding Rule 21): stub ini TIDAK BOLEH diisi angka/
 * data contoh yang terlihat seperti data produksi (order, stok, sales) —
 * kalau perlu contoh visual di fase berikutnya, harus jelas ditandai
 * sebagai contoh, bukan angka polos yang bisa disalahartikan.
 */
export function RouteStub({
  title,
  phase,
  description,
}: {
  title: string;
  phase: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex max-w-(--container-wide) flex-col items-start gap-3 px-4 py-16 md:px-6">
      <span className="flex items-center gap-1.5 rounded-full bg-soft-sage px-3 py-1 text-xs font-medium text-deep-pine">
        <Construction size={13} aria-hidden="true" />
        {phase}
      </span>
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      {description && <p className="max-w-prose text-muted">{description}</p>}
      <p className="text-sm text-muted">
        Rute ini sudah terdaftar sesuai struktur PRD (§8, §38) — konten
        sebenarnya belum dibangun pada Fase 1 (Foundation).
      </p>
    </div>
  );
}
