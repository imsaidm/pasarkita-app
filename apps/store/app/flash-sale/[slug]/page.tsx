import Link from "next/link";
import { Zap } from "lucide-react";

/**
 * §28-30 Flash Sale. `featureFlags.flashSale` di lib/config/tenant.ts
 * masih `false` (belum diaktifkan pemilik proyek) — halaman ini SENGAJA
 * menampilkan status nonaktif apa adanya, bukan pura-pura ada flash sale
 * berjalan dengan countdown palsu. Begitu flag diaktifkan dan mekanisme
 * flash sale sungguhan dirancang (§28-30), halaman ini diisi kontennya.
 */
export default async function FlashSalePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params;
  return (
    <div className="mx-auto flex max-w-(--container-content) flex-col items-center gap-3 px-4 py-20 text-center md:px-6">
      <Zap size={40} strokeWidth={1.4} className="text-muted" aria-hidden="true" />
      <h1 className="text-xl font-semibold text-ink">Flash Sale belum aktif</h1>
      <p className="max-w-sm text-sm text-muted">
        Fitur Flash Sale (PRD §28-30) belum diaktifkan pada prototype ini —
        lihat <code className="rounded bg-soft-sand px-1 py-0.5 text-xs">featureFlags.flashSale</code>{" "}
        di konfigurasi toko. Cek koleksi Promo untuk penawaran yang sedang berjalan.
      </p>
      <Link
        href="/promo"
        className="tap-target mt-2 inline-flex items-center rounded-full bg-karyalo-green px-6 py-3 text-sm font-semibold text-warm-white hover:opacity-90"
      >
        Lihat Promo
      </Link>
    </div>
  );
}
