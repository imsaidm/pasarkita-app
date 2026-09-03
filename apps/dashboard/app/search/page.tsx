import { Search } from "lucide-react";

/**
 * PRD §8.4 Global Controls — hasil pencarian order/produk/customer.
 * Fase 1: menerima query dan menampilkannya kembali (navigasi dari
 * GlobalAdminSearch sudah nyata), TAPI index pencarian sungguhan belum
 * ada (order/produk/customer belum tersambung backend — Fase 3/4/5).
 */
// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  return (
    <div className="mx-auto flex max-w-(--container-content) flex-col items-start gap-3 px-4 py-16 md:px-6">
      <span className="rounded-full bg-soft-sage px-3 py-1 text-xs font-medium text-deep-pine">
        Fase 3-5 — Catalog, OMS, Customers
      </span>
      <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
        <Search size={20} aria-hidden="true" />
        {query ? `Hasil untuk "${query}"` : "Pencarian"}
      </h1>
      <p className="max-w-prose text-muted">
        {query
          ? `Pencarian order/produk/pelanggan untuk "${query}" belum tersambung ke index sungguhan — belum ada backend Catalog/OMS/CRM yang bisa dicari (§8.4, Fase 3-5).`
          : "Ketik kata kunci pada kolom pencarian di atas."}
      </p>
    </div>
  );
}
