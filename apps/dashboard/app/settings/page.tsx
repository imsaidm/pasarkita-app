"use client";

import Link from "next/link";
import {
  Settings as SettingsIcon,
  User,
  Store,
  Truck,
  CreditCard,
  Bell,
  Users,
  Shield,
  FileText,
  Plug,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useSession, CapabilitySet } from "@/lib/auth/session-context";

interface SettingModule {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  capability?: keyof CapabilitySet;
  category: "Akun & Profil" | "Operasional Toko" | "Tim & Keamanan" | "Sistem & Integrasi";
}

const ALL_SETTINGS: SettingModule[] = [
  {
    href: "/settings/profile",
    title: "Profil Pengguna & Akun",
    description: "Data diri staf penanggung jawab, kontak WhatsApp, dan riwayat login.",
    icon: User,
    category: "Akun & Profil",
  },
  {
    href: "/settings/store",
    title: "Informasi Toko",
    description: "Nama toko, mata uang default (IDR), dan zona waktu operasional (WIB).",
    icon: Store,
    category: "Operasional Toko",
  },
  {
    href: "/settings/shipping",
    title: "Jasa Kirim & Ekspedisi",
    description: "Pilihan kurir reguler/express (SPX, J&T, SiCepat) dan estimasi ongkir.",
    icon: Truck,
    category: "Operasional Toko",
  },
  {
    href: "/settings/payments",
    title: "Rekening Pembayaran & Payout",
    description: "Rekening bank penarikan dana hasil penjualan dan gateway pembayaran.",
    icon: CreditCard,
    badge: "👑 Khusus Owner",
    capability: "teamRoleManage",
    category: "Tim & Keamanan",
  },
  {
    href: "/settings/notifications",
    title: "Notifikasi & Pesan Otomatis",
    description: "Preferensi pemberitahuan pesanan baru, stok menipis, dan webhook.",
    icon: Bell,
    category: "Operasional Toko",
  },
  {
    href: "/settings/team",
    title: "Tim & Hak Akses Staf",
    description: "Daftar staf aktif, peran operasional toko, dan undang anggota baru.",
    icon: Users,
    badge: "👑 Khusus Owner",
    capability: "teamRoleManage",
    category: "Tim & Keamanan",
  },
  {
    href: "/settings/roles",
    title: "Matriks Role & Izin Akses",
    description: "Detail pembagian kapabilitas fitur antara Owner, Admin Toko, dan Gudang.",
    icon: Shield,
    badge: "👑 Khusus Owner",
    capability: "teamRoleManage",
    category: "Tim & Keamanan",
  },
  {
    href: "/settings/audit-log",
    title: "Audit Log & Riwayat Aktivitas",
    description: "Catatan riwayat perubahan data, aksi staf, dan keamanan transaksi.",
    icon: FileText,
    category: "Sistem & Integrasi",
  },
  {
    href: "/settings/integrations",
    title: "Integrasi Shopee & Sistem",
    description: "Status koneksi Shopee OpenAPI v2 Hub dan webhook multi-channel.",
    icon: Plug,
    badge: "👑 Khusus Owner",
    capability: "teamRoleManage",
    category: "Sistem & Integrasi",
  },
];

// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default function SettingsHubPage() {
  const { userName, userEmail, role, storeName, capabilities } = useSession();

  const visibleSettings = ALL_SETTINGS.filter(
    (item) => !item.capability || (capabilities && capabilities[item.capability])
  );

  const categories: ("Akun & Profil" | "Operasional Toko" | "Tim & Keamanan" | "Sistem & Integrasi")[] = [
    "Akun & Profil",
    "Operasional Toko",
    "Tim & Keamanan",
    "Sistem & Integrasi",
  ];

  return (
    <div className="mx-auto max-w-(--container-content) px-3.5 py-5 pb-24 sm:px-6 sm:py-8 sm:pb-12">
      {/* Header Pengaturan */}
      <div className="mb-6 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <SettingsIcon size={24} className="text-karyalo-green" aria-hidden="true" />
          <h1 className="text-lg font-bold text-ink sm:text-2xl">Pusat Pengaturan Toko</h1>
        </div>
        <p className="text-xs text-muted sm:text-sm">
          Kelola profil akun, konfigurasi toko, hak akses staf, dan integrasi kanal penjualan.
        </p>
      </div>

      {/* Kartu Profil Ringkas Pengguna */}
      <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-border bg-warm-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-soft-sage text-base font-bold text-deep-pine border border-karyalo-green/20">
            {role === "Owner" ? "👑" : role === "AdminDashboard" ? "💻" : "📦"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-ink">{userName}</h2>
              <span className="inline-flex items-center rounded-md bg-soft-sand px-2 py-0.5 text-xs font-semibold text-ink">
                Role: {role}
              </span>
            </div>
            <p className="text-xs text-muted font-mono">{userEmail} • {storeName}</p>
          </div>
        </div>

        <Link
          href="/settings/profile"
          className="tap-target self-start rounded-xl border border-border bg-soft-sand px-3.5 py-2 text-xs font-semibold text-ink hover:bg-soft-sage hover:border-karyalo-green transition-colors sm:self-auto"
        >
          Lihat Profil Lengkap →
        </Link>
      </div>

      {/* Grid Pengaturan Berdasarkan Kategori */}
      <div className="flex flex-col gap-8">
        {categories.map((cat) => {
          const items = visibleSettings.filter((s) => s.category === cat);
          if (items.length === 0) return null;

          return (
            <section key={cat} aria-label={cat} className="flex flex-col gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted px-1">
                {cat}
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="tap-target group flex flex-col justify-between rounded-2xl border border-border bg-warm-white p-4 shadow-2xs hover:border-karyalo-green hover:shadow-xs transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="flex size-9 items-center justify-center rounded-xl bg-soft-sand text-deep-pine group-hover:bg-soft-sage group-hover:text-karyalo-green transition-colors">
                            <Icon size={18} aria-hidden="true" />
                          </span>
                          {item.badge && (
                            <span className="rounded-md bg-soft-sage px-2 py-0.5 text-xs font-bold text-deep-pine border border-karyalo-green/20">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <h3 className="text-xs font-bold text-ink group-hover:text-karyalo-green transition-colors">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-end text-xs font-semibold text-karyalo-green group-hover:translate-x-0.5 transition-transform">
                        <ChevronRight size={16} aria-hidden="true" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
