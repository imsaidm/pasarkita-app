import Link from "next/link";
import { getTeamMembers } from "@/lib/data/team";
import { ROLE_LABEL, BaselineRole } from "@/lib/auth/session-context";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";
import { PermissionGate } from "@/components/system/PermissionGate";
import { SettingsSubNav } from "@/components/settings/SettingsSubNav";
import { Users, Shield, Mail, User } from "lucide-react";

/**
 * Format badge dan ringkasan wewenang untuk tiap role
 */
const ROLE_CONFIG: Record<
  BaselineRole,
  {
    icon: string;
    label: string;
    badgeStyle: string;
    summary: string;
  }
> = {
  Owner: {
    icon: "👑",
    label: "Owner / Pemilik Toko",
    badgeStyle: "bg-soft-sage text-deep-pine border-karyalo-green/30",
    summary: "Akses Mutlak (Finansial, Tim, Shopee API)",
  },
  AdminDashboard: {
    icon: "💻",
    label: "Admin Toko / Dashboard",
    badgeStyle: "bg-soft-sand text-ink border-border",
    summary: "Katalog, OMS Pesanan, Storefront CMS, Promo",
  },
  AdminWarehouse: {
    icon: "📦",
    label: "Admin Warehouse / Gudang",
    badgeStyle: "bg-terracotta-soft/70 text-deep-pine border-status-warning/30",
    summary: "Fulfillment, Input Resi Ekspedisi, Stok SKU",
  },
};

// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function TeamSettingsPage() {
  const members = await getTeamMembers();

  return (
    <div className="mx-auto max-w-(--container-content) px-3.5 py-5 pb-24 sm:px-6 sm:py-8 sm:pb-12">
      {/* Sub-Navigasi Pengaturan Mobile & Desktop */}
      <SettingsSubNav />

      {/* Header Halaman */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users size={22} className="text-karyalo-green" aria-hidden="true" />
            <h1 className="text-lg font-bold text-ink sm:text-2xl">Tim & Hak Akses Staf</h1>
          </div>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            Daftar {members.length} staf aktif dan pembagian role operasional toko.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/settings/roles"
            className="tap-target inline-flex items-center gap-1.5 rounded-xl border border-border bg-soft-sand px-3 py-2 text-xs font-semibold text-ink hover:bg-soft-sage hover:border-karyalo-green transition-colors"
          >
            <Shield size={14} aria-hidden="true" />
            <span>Matriks Role</span>
          </Link>

          <PermissionGate capability="teamRoleManage">
            <button className="tap-target rounded-xl bg-karyalo-green px-3.5 py-2 text-xs font-semibold text-warm-white hover:opacity-90 transition-colors shadow-2xs">
              + Undang Staf Baru
            </button>
          </PermissionGate>
        </div>
      </div>

      <PermissionGate
        capability="teamRoleManage"
        showDenied
        deniedMessage="Hanya Owner / Pemilik Toko yang memiliki wewenang untuk mengundang anggota tim baru atau mengubah peran staf."
      >
        <></>
      </PermissionGate>

      <div className="my-4">
        <SampleDataBanner />
      </div>

      {/* Tabel Bersih & Jelas — Tampilan Desktop */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-warm-white shadow-2xs sm:block">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-soft-sand text-muted">
            <tr>
              <th className="px-4 py-3.5 font-semibold text-ink">Nama Anggota</th>
              <th className="px-4 py-3.5 font-semibold text-ink">Email</th>
              <th className="px-4 py-3.5 font-semibold text-ink">Role / Peran</th>
              <th className="px-4 py-3.5 font-semibold text-ink">Cakupan Wewenang</th>
              <th className="px-4 py-3.5 text-center font-semibold text-ink">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((m) => {
              const config = ROLE_CONFIG[m.role];
              return (
                <tr key={m.id} className="hover:bg-soft-sand/40 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-ink">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-soft-sand text-xs font-bold">
                        {config.icon}
                      </span>
                      <span>{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted">
                    <span className="font-mono text-xs">{m.maskedEmail}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${config.badgeStyle}`}
                    >
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted">
                    <span>{config.summary}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 rounded-md bg-soft-sage px-2 py-0.5 text-xs font-semibold text-status-success">
                      <span className="size-1.5 rounded-full bg-status-success" />
                      {m.status === "active" ? "Aktif" : "Diundang"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tampilan Kartu Ringkas — Khusus Mobile */}
      <div className="flex flex-col gap-3 sm:hidden">
        {members.map((m) => {
          const config = ROLE_CONFIG[m.role];
          return (
            <div
              key={m.id}
              className="flex flex-col gap-2.5 rounded-2xl border border-border bg-warm-white p-4 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-soft-sand text-sm font-bold">
                    {config.icon}
                  </span>
                  <div>
                    <h2 className="text-xs font-bold text-ink">{m.name}</h2>
                    <p className="text-xs font-mono text-muted">{m.maskedEmail}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md bg-soft-sage px-2 py-0.5 text-xs font-semibold text-status-success">
                  <span className="size-1.5 rounded-full bg-status-success" />
                  {m.status === "active" ? "Aktif" : "Diundang"}
                </span>
              </div>

              <div className="border-t border-border/70 pt-2 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Peran:</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-bold ${config.badgeStyle}`}
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </span>
                </div>
                <p className="text-xs text-muted">{config.summary}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
