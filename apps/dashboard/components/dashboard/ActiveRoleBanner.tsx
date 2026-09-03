"use client";

import { useSession, BASELINE_ROLES, ROLE_LABEL } from "@/lib/auth/session-context";
import { ShieldCheck, ShieldAlert, Check, X, Shield } from "lucide-react";
import Link from "next/link";

export function ActiveRoleBanner() {
  const { role, userName } = useSession();

  const getRoleDetails = () => {
    switch (role) {
      case "AdminWarehouse":
        return {
          title: "Mode: Staf Gudang & Logistik",
          badge: "📦 Gudang (Logistik & Fulfillment)",
          description:
            "Akses dipusatkan pada pemrosesan packing pesanan, pencetakan label resi, dan pembaruan stok fisik inventori.",
          allowed: [
            "Pemrosesan order & fulfillment",
            "Cetak label resi SPX/J&T/SiCepat",
            "Update stok fisik katalog & SKU",
          ],
          restricted: [
            "Pengeditan CMS & tema storefront",
            "Pembuatan kampanye promosi & voucher",
            "Pengaturan rekening bank & tim staf",
            "Melihat data kontak sensitif pelanggan (PII)",
          ],
        };

      case "AdminDashboard":
        return {
          title: "Mode: Admin Toko & Operasional",
          badge: "💻 Admin Toko (Operasional Harian)",
          description:
            "Akses operasional harian lengkap: katalog produk, promosi diskon, pemrosesan order, dan CMS storefront.",
          allowed: [
            "Kelola katalog, harga & varian produk",
            "Kustomisasi CMS web storefront",
            "Buat voucher diskon & harga coret",
            "Pantau pesanan masuk Web & Shopee",
          ],
          restricted: [
            "Menambah atau menghapus akun staf toko",
            "Mengubah izin role & kewenangan staf",
            "Pengaturan rekening penarikan dana toko",
          ],
        };

      case "Owner":
      default:
        return {
          title: "Mode: Pemilik Toko (Full Access)",
          badge: "👑 Owner / Pemilik Toko",
          description:
            "Akses mutlak tanpa batasan: kontrol penuh atas seluruh modul operasional, tim staf, keuangan, dan Shopee OpenAPI.",
          allowed: [
            "Akses mutlak ke seluruh 9 modul toko",
            "Kelola tim staf & hak akses role",
            "Sinkronisasi Shopee OpenAPI v2 Hub",
            "Ekspor laporan omzet & analitik bisnis",
          ],
          restricted: [],
        };
    }
  };

  const details = getRoleDetails();

  return (
    <div className="rounded-2xl border border-border bg-warm-white p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-soft-sand text-deep-pine">
            <Shield size={20} aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-soft-sage px-2.5 py-0.5 text-xs font-bold text-deep-pine">
                {details.badge}
              </span>
              <span className="text-xs text-muted">
                User aktif: <strong className="text-ink">{userName}</strong>
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">
              {details.description}
            </p>
          </div>
        </div>

        <Link
          href="/settings/roles"
          className="tap-target inline-flex shrink-0 items-center justify-center rounded-xl border border-border bg-soft-sand px-3 py-1.5 text-xs font-semibold text-ink hover:border-karyalo-green hover:bg-warm-white transition-colors"
        >
          Lihat Matriks Role
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-border/80 pt-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-status-success flex items-center gap-1">
            <ShieldCheck size={14} />
            <span>Izin & Fitur yang Diizinkan:</span>
          </span>
          <ul className="flex flex-col gap-1 text-xs text-ink pl-1">
            {details.allowed.map((item, idx) => (
              <li key={idx} className="flex items-center gap-1.5">
                <Check size={12} className="text-status-success shrink-0 stroke-[3]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {details.restricted.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-status-warning flex items-center gap-1">
              <ShieldAlert size={14} />
              <span>Fitur yang Dibatasi untuk Role Ini:</span>
            </span>
            <ul className="flex flex-col gap-1 text-xs text-muted pl-1">
              {details.restricted.map((item, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <X size={12} className="text-status-warning shrink-0 stroke-[2.5]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
