"use client";

import { useState } from "react";
import { useSession, BaselineRole } from "@/lib/auth/session-context";
import {
  User,
  Mail,
  Shield,
  Phone,
  Store,
  KeyRound,
  CheckCircle2,
  LogOut,
  Save,
  Laptop,
  Clock,
} from "lucide-react";
import { SettingsSubNav } from "@/components/settings/SettingsSubNav";
import { useRouter } from "next/navigation";

// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default function ProfilePage() {
  const router = useRouter();
  const { userName, userEmail, storeName, role, logout } = useSession();

  const [nameInput, setNameInput] = useState(userName);
  const [phoneInput, setPhoneInput] = useState("+62 812-9876-5432");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const getRoleBadge = (r: BaselineRole) => {
    switch (r) {
      case "Owner":
        return {
          icon: "👑",
          label: "Owner / Pemilik Toko",
          badge: "bg-soft-sage text-deep-pine border-karyalo-green/30",
          desc: "Wewenang administratif mutlak atas seluruh operasional toko, keuangan, dan integrasi Shopee API.",
        };
      case "AdminDashboard":
        return {
          icon: "💻",
          label: "Admin Toko / Dashboard",
          badge: "bg-soft-sand text-ink border-border",
          desc: "Pengelola harian pesanan OMS, katalog produk, diskon marketing, dan CMS storefront web.",
        };
      case "AdminWarehouse":
        return {
          icon: "📦",
          label: "Admin Warehouse / Gudang",
          badge: "bg-terracotta-soft text-deep-pine border-status-warning/30",
          desc: "Staf fulfillment khusus pemrosesan antrean packing, input nomor resi ekspedisi, dan stok fisik SKU.",
        };
    }
  };

  const roleInfo = getRoleBadge(role);

  return (
    <div className="mx-auto max-w-(--container-content) px-3.5 py-5 pb-24 sm:px-6 sm:py-8 sm:pb-12">
      {/* Sub-Navigasi Pengaturan Mobile & Desktop */}
      <SettingsSubNav />

      {/* Header Halaman */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <User size={22} className="text-karyalo-green" aria-hidden="true" />
            <h1 className="text-lg font-bold text-ink sm:text-2xl">Profil Pengguna & Akun</h1>
          </div>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            Informasi akun staf, detail wewenang operasional toko, dan keamanan login.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="tap-target inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-status-critical/30 bg-terracotta-soft/50 px-3.5 py-2 text-xs font-semibold text-status-critical hover:bg-terracotta-soft transition-colors shadow-2xs"
        >
          <LogOut size={14} aria-hidden="true" />
          <span>Keluar dari Sesi</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-status-success/40 bg-soft-sage p-3 text-xs font-semibold text-deep-pine shadow-2xs animate-in fade-in">
          <CheckCircle2 size={16} className="text-status-success" aria-hidden="true" />
          <span>Perubahan profil berhasil disimpan.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom Kiri: Kartu Identitas & Role */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-warm-white p-5 shadow-2xs text-center flex flex-col items-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-soft-sage text-2xl font-bold text-deep-pine border border-karyalo-green/20 shadow-xs">
              {roleInfo.icon}
            </div>

            <h2 className="mt-3 text-base font-bold text-ink">{userName}</h2>
            <p className="text-xs text-muted font-mono">{userEmail}</p>

            <div className="mt-3">
              <span
                className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-bold ${roleInfo.badge}`}
              >
                <span>{roleInfo.icon}</span>
                <span>{roleInfo.label}</span>
              </span>
            </div>

            <div className="mt-4 w-full border-t border-border/70 pt-3 text-left">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Toko Aktif:</span>
                <strong className="text-ink">{storeName}</strong>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span>Status Akun:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-status-success">
                  <span className="size-1.5 rounded-full bg-status-success" />
                  Aktif & Terverifikasi
                </span>
              </div>
            </div>
          </div>

          {/* Kartu Deskripsi Wewenang Akun */}
          <div className="rounded-2xl border border-border bg-warm-white p-4 shadow-2xs text-xs">
            <div className="flex items-center gap-1.5 font-bold text-ink mb-1.5">
              <Shield size={15} className="text-karyalo-green" aria-hidden="true" />
              <span>Deskripsi Wewenang Akun</span>
            </div>
            <p className="text-muted text-xs leading-relaxed">
              {roleInfo.desc}
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Form Edit Data Diri & Keamanan */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Form Informasi Pribadi */}
          <form
            onSubmit={handleSave}
            className="rounded-2xl border border-border bg-warm-white p-5 shadow-2xs flex flex-col gap-4"
          >
            <div className="border-b border-border/80 pb-3">
              <h2 className="text-sm font-bold text-ink">Informasi Pribadi & Kontak</h2>
              <p className="text-xs text-muted">Perbarui data profil penanggung jawab toko.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink">Nama Lengkap</label>
                <div className="relative flex items-center">
                  <User size={14} className="absolute left-3 text-muted" aria-hidden="true" />
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-warm-white py-2 pl-9 pr-3 text-xs text-ink focus:border-karyalo-green focus:outline-hidden focus-visible:ring-1 focus-visible:ring-karyalo-green"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-ink">Email Login</label>
                <div className="relative flex items-center">
                  <Mail size={14} className="absolute left-3 text-muted" aria-hidden="true" />
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full rounded-xl border border-border bg-soft-sand py-2 pl-9 pr-3 text-xs text-muted font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-ink">Nomor WhatsApp / HP</label>
                <div className="relative flex items-center">
                  <Phone size={14} className="absolute left-3 text-muted" aria-hidden="true" />
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full rounded-xl border border-border bg-warm-white py-2 pl-9 pr-3 text-xs text-ink focus:border-karyalo-green focus:outline-hidden focus-visible:ring-1 focus-visible:ring-karyalo-green"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-ink">Nama Usaha / Toko</label>
                <div className="relative flex items-center">
                  <Store size={14} className="absolute left-3 text-muted" aria-hidden="true" />
                  <input
                    type="text"
                    value={storeName}
                    disabled
                    className="w-full rounded-xl border border-border bg-soft-sand py-2 pl-9 pr-3 text-xs text-muted cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="tap-target inline-flex items-center gap-1.5 rounded-xl bg-deep-pine px-4 py-2 text-xs font-semibold text-warm-white hover:bg-karyalo-green transition-colors shadow-2xs"
              >
                <Save size={14} aria-hidden="true" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>

          {/* Keamanan & Sesi Login */}
          <div className="rounded-2xl border border-border bg-warm-white p-5 shadow-2xs flex flex-col gap-4">
            <div className="border-b border-border/80 pb-3">
              <h2 className="text-sm font-bold text-ink">Keamanan & Riwayat Sesi</h2>
              <p className="text-xs text-muted">Pengaturan kredensial login dan verifikasi perangkat aktif.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-soft-sand/40 p-3.5 flex flex-col justify-between gap-2">
                <div className="flex items-center gap-2">
                  <KeyRound size={16} className="text-deep-pine" aria-hidden="true" />
                  <span className="text-xs font-bold text-ink">Kata Sandi Akun</span>
                </div>
                <p className="text-xs text-muted">Kata sandi terakhir diubah 30 hari yang lalu.</p>
                <button
                  type="button"
                  onClick={() => alert("Fitur ubah kata sandi tersedia di mode produksi.")}
                  className="tap-target self-start rounded-lg border border-border bg-warm-white px-2.5 py-1 text-xs font-semibold text-ink hover:bg-soft-sand"
                >
                  Ubah Kata Sandi
                </button>
              </div>

              <div className="rounded-xl border border-border bg-soft-sand/40 p-3.5 flex flex-col justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Laptop size={16} className="text-karyalo-green" aria-hidden="true" />
                  <span className="text-xs font-bold text-ink">Sesi Perangkat Aktif</span>
                </div>
                <p className="text-xs text-muted">Perangkat ini: Windows (Chrome) • Jakarta, ID</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-status-success">
                  <Clock size={12} />
                  <span>Sedang Aktif Sekarang</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
