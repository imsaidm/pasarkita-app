import { headers } from "next/headers";
import { Store, ScanLine } from "lucide-react";
import { readSecret, readSession } from "@pasarkita/auth";
import { listCatalog } from "@pasarkita/db";
import { CHANNEL_LABELS, TIER_LABELS } from "@pasarkita/plan";
import Register from "./Register";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const cookieHeader = (await headers()).get("cookie");
  const session = readSession(cookieHeader, readSecret());

  if (session === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-soft-sand px-4 py-10">
        <div className="w-full max-w-sm text-center">
          <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-(--radius-card) bg-deep-pine">
            <Store size={22} className="text-warm-white" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-bold tracking-tight text-deep-pine">Kasir Pasarkita</h1>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            Transaksi di tempat, tetap jalan waktu internet mati. Coba dulu tanpa daftar — yang
            dibuka toko contoh berisi data palsu, bukan data toko sungguhan.
          </p>

          <form method="post" action="/api/demo" className="mt-5">
            <button
              type="submit"
              className="tap-target-pos w-full rounded-full bg-karyalo-green px-6 py-3 text-sm font-semibold text-warm-white hover:opacity-90"
            >
              Coba demo kasir
            </button>
          </form>

          <p className="mt-4 text-xs text-muted">
            Sudah punya akun? Masuk lewat{" "}
            <a
              href="https://dashboard.pasarkita.net"
              className="font-medium text-karyalo-green"
            >
              Kelola Toko
            </a>
            , lalu kembali ke sini.
          </p>
        </div>
      </div>
    );
  }

  const outletId = `${session.tenantId}_outlet`;
  let catalog;
  try {
    catalog = await listCatalog(session.tenantId, outletId);
  } catch {
    return (
      <div className="mx-auto max-w-(--container-content) px-4 py-16">
        <div className="rounded-(--radius-card) border border-border border-l-4 border-l-status-critical bg-white px-4 py-3.5">
          <p className="text-sm font-semibold text-status-critical">Katalog belum bisa dibaca</p>
          <p className="mt-1 text-xs text-muted">
            Muat ulang sebentar lagi. Kalau tetap begini, data contoh kemungkinan belum
            disiapkan di server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-soft-sand">
      <header className="sticky top-0 z-30 border-b border-border bg-warm-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-(--container-wide) items-center gap-3 px-3.5 py-2.5 sm:px-6">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-deep-pine">
            <ScanLine size={17} className="text-warm-white" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight text-deep-pine">Kasir</p>
            <p className="truncate text-[11px] text-muted">
              {CHANNEL_LABELS[session.plan.channel]} · {TIER_LABELS[session.plan.tier]} ·{" "}
              {catalog.length} produk
            </p>
          </div>

          {session.kind === "demo" ? (
            <a
              href="/api/demo?keluar=1"
              className="tap-target ml-auto shrink-0 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-muted hover:border-karyalo-green hover:text-karyalo-green"
            >
              Keluar demo
            </a>
          ) : null}
        </div>

        {session.kind === "demo" ? (
          <p className="border-t border-accent-cyan/30 bg-soft-sage px-3.5 py-1.5 text-[11px] text-deep-pine sm:px-6">
            <strong className="font-semibold">Mode demo.</strong> Data palsu dan direset berkala.
            Transaksi tercatat, tapi tidak ada uang sungguhan yang berpindah.
          </p>
        ) : null}
      </header>

      <Register items={catalog} />
    </div>
  );
}
