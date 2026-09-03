"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, CapabilitySet } from "@/lib/auth/session-context";
import { TopBar } from "@/components/layout/TopBar";
import { DesktopSideNavigation } from "@/components/layout/DesktopSideNavigation";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";
import { ConnectivityBanner } from "@/components/layout/ConnectivityBanner";
import { ServiceWorkerRegister } from "@/components/system/ServiceWorkerRegister";
import { Loader2, ShieldAlert, ArrowLeft } from "lucide-react";

const ROUTE_CAPABILITIES: { prefix: string; capability: keyof CapabilitySet; label: string }[] = [
  { prefix: "/storefront", capability: "cmsWrite", label: "Storefront CMS & Tema" },
  { prefix: "/marketing", capability: "promotionWrite", label: "Promosi & Marketing" },
  { prefix: "/analytics", capability: "analyticsExport", label: "Laporan & Analytics" },
  { prefix: "/settings/team", capability: "teamRoleManage", label: "Kelola Tim & Staf" },
  { prefix: "/settings/roles", capability: "teamRoleManage", label: "Pengaturan Role & Hak Akses" },
  { prefix: "/settings/integrations", capability: "teamRoleManage", label: "Integrasi Shopee & Sistem" },
  { prefix: "/settings/payments", capability: "teamRoleManage", label: "Pengaturan Rekening & Pembayaran" },
];

// Halaman masuk tidak boleh memakai kerangka admin: navigasinya menuju
// halaman yang justru butuh sesi, jadi tampil sebelum masuk hanya
// menghasilkan tautan yang memantulkan pengguna kembali ke sini.
const HALAMAN_TANPA_SHELL = ["/login"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (HALAMAN_TANPA_SHELL.includes(pathname)) return <>{children}</>;
  const router = useRouter();
  const { isAuthenticated, hydrated, capabilities, role } = useSession();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (!hydrated) return;
    // Jika belum login dan bukan di halaman login -> arahkan ke /login
    if (!isAuthenticated && !isLoginPage) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoginPage, hydrated, router]);

  // Halaman Login: Render penuh tanpa sidebar & navigasi admin
  if (isLoginPage) {
    return (
      <main id="main-content" className="min-h-screen w-full bg-soft-sand/30">
        {children}
        <ServiceWorkerRegister />
      </main>
    );
  }

  // Jika belum ter-hidrasi atau belum autentikasi saat mengakses halaman terproteksi
  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-soft-sand/30 p-6 text-center">
        <Loader2 size={28} className="animate-spin text-deep-pine" aria-hidden="true" />
        <p className="text-xs font-medium text-muted">Memverifikasi sesi login...</p>
      </div>
    );
  }

  // Periksa apakah rute saat ini membutuhkan capability yang tidak dimiliki oleh role aktif
  const restrictedRoute = ROUTE_CAPABILITIES.find(
    (item) => pathname === item.prefix || pathname.startsWith(item.prefix + "/")
  );
  const isDenied = restrictedRoute && capabilities && !capabilities[restrictedRoute.capability];

  // Dashboard & Modul Terproteksi
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-deep-pine focus:px-4 focus:py-2 focus:text-warm-white"
      >
        Lompat ke konten utama
      </a>
      <TopBar />
      <ConnectivityBanner />
      <div className="flex w-full min-w-0 max-w-full overflow-x-hidden">
        <DesktopSideNavigation />
        <main
          id="main-content"
          className="pwa-main-content min-h-[calc(100vh-3.5rem)] w-full min-w-0 max-w-full flex-1 overflow-x-hidden pb-20 xl:pb-0"
        >
          {isDenied ? (
            <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 px-4 py-20 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-terracotta-soft text-status-warning shadow-xs">
                <ShieldAlert size={28} aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-ink sm:text-xl">
                  Akses Modul Dibatasi
                </h1>
                <p className="mt-1.5 text-xs text-muted leading-relaxed">
                  Modul <strong>{restrictedRoute.label}</strong> tidak diaktifkan untuk peran{" "}
                  <strong>{role}</strong>. Silakan hubungi Owner toko atau ganti role melalui tombol di bilah atas untuk menguji fitur ini.
                </p>
              </div>
              <Link
                href="/"
                className="tap-target inline-flex items-center gap-2 rounded-xl bg-deep-pine px-4 py-2.5 text-xs font-semibold text-warm-white hover:bg-karyalo-green transition-colors"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                <span>Kembali ke Dashboard Utama</span>
              </Link>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
      <MobileBottomNavigation />
      <ServiceWorkerRegister />
    </>
  );
}
