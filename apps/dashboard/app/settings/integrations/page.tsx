import Link from "next/link";
import { ArrowRight, CheckCircle2, ShoppingBag, CreditCard, Truck, Mail, Database, Plug } from "lucide-react";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";
import { SettingsSubNav } from "@/components/settings/SettingsSubNav";

interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  description: string;
  status: string;
  connected: boolean;
  href?: string;
  icon: typeof ShoppingBag;
  highlight?: boolean;
}

const INTEGRATIONS: IntegrationItem[] = [
  {
    id: "shopee",
    name: "Shopee Open Platform (Marketplace API)",
    category: "Marketplace & Multi-Channel",
    description: "Sinkronisasi pesanan Shopee, update stok real-time (v2.product), pelacakan resi SPX/J&T (v2.logistics), dan webhook order otomatis.",
    status: "Terhubung (Shop ID: 918230114)",
    connected: true,
    href: "/settings/integrations/shopee",
    icon: ShoppingBag,
    highlight: true,
  },
  {
    id: "biteship",
    name: "Biteship (Logistik & Ongkir)",
    category: "Kurir & Pengiriman",
    description: "Cek tarif ongkir multi-ekspedisi, penjemputan paket otomatis, dan tracking nomor resi pengiriman storefront.",
    status: "Fase 5 (Development Baseline)",
    connected: false,
    icon: Truck,
  },
  {
    id: "doku",
    name: "DOKU Payment Gateway",
    category: "Pembayaran Online",
    description: "Penerbitan Virtual Account (BCA, BRI, BSI, Mandiri) dan verifikasi notifikasi webhook pembayaran lunas.",
    status: "Fase 5 (Development Baseline)",
    connected: false,
    icon: CreditCard,
  },
  {
    id: "resend",
    name: "Resend (Email Transaksional)",
    category: "Komunikasi",
    description: "Pengiriman invoice pesanan, verifikasi email pelanggan, dan tautan reset password.",
    status: "Belum terhubung",
    connected: false,
    icon: Mail,
  },
  {
    id: "convex",
    name: "Convex (Backend & Database Cloud)",
    category: "Infrastruktur",
    description: "Sinkronisasi data real-time, push notification trigger, dan document storage.",
    status: "Tersambung (Shared Client)",
    connected: true,
    icon: Database,
  },
];

/** PRD §19.4 Integrations — Multi-channel & External Services Manager */
// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default function IntegrationsSettingsPage() {
  return (
    <div className="mx-auto max-w-(--container-wide) px-3.5 py-5 pb-24 sm:px-6 sm:py-8 sm:pb-12">
      {/* Sub-Navigasi Pengaturan Mobile & Desktop */}
      <SettingsSubNav />

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Plug size={22} className="text-karyalo-green" aria-hidden="true" />
          <h1 className="text-lg font-bold text-ink sm:text-2xl">Integrasi & Channel API</h1>
        </div>
        <p className="mt-1 text-xs text-muted sm:text-sm">
          Kelola koneksi marketplace, gateway pembayaran, logistik, dan layanan pihak ketiga.
        </p>
      </div>

      <SampleDataBanner note="Modul Shopee Open Platform aktif untuk verifikasi API Partner Shopee. Layanan pembayaran & kurir lain dalam baseline pengembangan." />

      <div className="flex flex-col gap-4">
        {INTEGRATIONS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`flex flex-col justify-between gap-4 rounded-(--radius-card) border p-5 transition-all sm:flex-row sm:items-center ${
                item.highlight
                  ? "border-[#ee4d2d]/30 bg-gradient-to-r from-warm-white via-warm-white to-[#ee4d2d]/5 shadow-xs"
                  : "border-border bg-warm-white"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                    item.highlight
                      ? "bg-[#ee4d2d]/10 text-[#ee4d2d]"
                      : "bg-soft-sand text-muted"
                  }`}
                >
                  <Icon size={22} aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-ink">{item.name}</h2>
                    {item.connected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-soft-sand px-2 py-0.5 text-xs font-medium text-status-success">
                        <CheckCircle2 size={12} className="text-status-success" aria-hidden="true" />
                        {item.status}
                      </span>
                    )}
                    {!item.connected && (
                      <span className="rounded-full bg-soft-sand px-2 py-0.5 text-xs font-medium text-muted">
                        {item.status}
                      </span>
                    )}
                  </div>
                  <p className="max-w-2xl text-xs leading-relaxed text-muted">{item.description}</p>
                </div>
              </div>

              {item.href ? (
                <Link
                  href={item.href}
                  className="tap-target inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-deep-pine px-4 py-2.5 text-xs font-semibold text-warm-white shadow-xs hover:bg-deep-pine/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-karyalo-green sm:w-auto sm:self-center sm:py-2"
                >
                  <span>Kelola Integrasi</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex w-full shrink-0 cursor-not-allowed items-center justify-center rounded-lg border border-border bg-soft-sand px-3.5 py-2 text-xs font-medium text-muted opacity-70 sm:w-auto sm:self-center sm:py-1.5"
                >
                  Konfigurasi
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
