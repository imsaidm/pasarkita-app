"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { GlobalAdminSearch } from "./GlobalAdminSearch";
import { NotificationBell } from "./NotificationBell";
import { TenantStoreSwitcher } from "./TenantStoreSwitcher";
import { RoleSwitcher } from "./RoleSwitcher";
import { useSession } from "@/lib/auth/session-context";

/**
 * TopBar Responsif — optimal di smartphone layar sempit (360px+) maupun desktop.
 */
export function TopBar() {
  const router = useRouter();
  const { userName, logout } = useSession();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-warm-white px-3 sm:px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/logo.png" alt="Karyalo" width={26} height={26} className="rounded-md" />
          <span className="hidden text-sm font-semibold text-ink sm:inline">Karyalo Manage</span>
        </Link>
        <GlobalAdminSearch />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <RoleSwitcher />
        <div className="hidden md:block">
          <TenantStoreSwitcher />
        </div>
        <NotificationBell />

        <Link
          href="/settings/profile"
          aria-label="Profil Pengguna & Akun"
          title="Profil Pengguna"
          className="tap-target flex items-center gap-1.5 rounded-full p-1 text-ink hover:bg-soft-sand focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-karyalo-green"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-soft-sage text-deep-pine">
            <User size={14} aria-hidden="true" />
          </span>
          <span className="hidden max-w-[8rem] truncate text-xs font-medium lg:inline">
            {userName}
          </span>
        </Link>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Keluar / Ganti Akun"
          title="Keluar / Logout"
          className="tap-target flex size-8 items-center justify-center rounded-full text-muted hover:bg-terracotta-soft hover:text-status-critical transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-status-critical"
        >
          <LogOut size={15} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
