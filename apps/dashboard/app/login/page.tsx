import { redirect } from "next/navigation";
import { Store } from "lucide-react";
import { currentSession } from "@/lib/tenant/resolve";

export const dynamic = "force-dynamic";

export const metadata = { title: "Masuk" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ gagal?: string; lanjut?: string }>;
}) {
  // Yang sudah masuk tidak perlu melihat halaman ini lagi.
  if ((await currentSession()) !== null) redirect("/");

  const params = await searchParams;
  const gagal = params.gagal === "1";

  // Hanya jalur di dalam aplikasi ini yang boleh jadi tujuan setelah masuk.
  // Tanpa penyaringan ini, `?lanjut=https://situs-lain` mengubah halaman
  // masuk menjadi pengalih terbuka.
  const lanjut =
    typeof params.lanjut === "string" &&
    params.lanjut.startsWith("/") &&
    !params.lanjut.startsWith("//")
      ? params.lanjut
      : "/";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-soft-sand px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-(--radius-card) bg-deep-pine">
            <Store size={22} className="text-warm-white" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-bold tracking-tight text-deep-pine">Kelola Toko</h1>
          <p className="text-xs text-muted">
            Masuk untuk mengatur produk, stok, pesanan, dan keuangan toko Anda.
          </p>
        </div>

        <form
          method="post"
          action="/api/login"
          className="flex flex-col gap-3.5 rounded-(--radius-card) border border-border bg-white px-5 py-6"
        >
          <input type="hidden" name="lanjut" value={lanjut} />

          {gagal ? (
            <p
              role="alert"
              className="rounded-lg border border-status-critical/30 bg-status-critical/5 px-3 py-2 text-xs text-status-critical"
            >
              Email atau kata sandi tidak cocok.
            </p>
          ) : null}

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              className="tap-target rounded-lg border border-border px-3 py-2 text-sm text-ink outline-none focus:border-karyalo-green"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink">Kata sandi</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="tap-target rounded-lg border border-border px-3 py-2 text-sm text-ink outline-none focus:border-karyalo-green"
            />
          </label>

          <button
            type="submit"
            className="tap-target mt-1 rounded-full bg-karyalo-green px-5 py-2.5 text-sm font-semibold text-warm-white hover:opacity-90"
          >
            Masuk
          </button>
        </form>

        <div className="mt-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
            atau
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <form method="post" action="/api/demo" className="mt-4">
          <button
            type="submit"
            className="tap-target w-full rounded-full border border-karyalo-green px-5 py-2.5 text-sm font-semibold text-karyalo-green hover:bg-soft-sage"
          >
            Lihat demo tanpa akun
          </button>
        </form>

        <p className="mt-3 text-center text-xs text-muted">
          Demo memakai toko contoh berisi data palsu. Pesanan yang dibuat di{" "}
          <a href="https://store.pasarkita.net" className="font-medium text-karyalo-green">
            demo toko online
          </a>{" "}
          akan muncul di sini.
        </p>
      </div>
    </div>
  );
}
