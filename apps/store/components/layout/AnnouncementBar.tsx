import { getTenantConfig } from "@/lib/config/tenant";

/**
 * HOME-01 / PRD §10 — Announcement bar. Konten WAJIB dari config/API,
 * bukan hard-coded (lihat komentar di lib/config/tenant.ts). Tidak
 * dirender sama sekali kalau tenant tidak set pesan apa pun — daripada
 * menampilkan placeholder palsu ("Gratis ongkir...") yang belum tentu
 * benar untuk tenant ini.
 */
export async function AnnouncementBar() {
  const tenant = await getTenantConfig();

  if (!tenant.announcement) return null;

  return (
    <div className="bg-deep-pine px-4 py-2 text-center text-xs font-medium text-warm-white sm:text-sm">
      {tenant.announcement}
    </div>
  );
}
