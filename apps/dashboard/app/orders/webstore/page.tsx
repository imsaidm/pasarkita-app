import { getOrdersByFilter } from "@/lib/data/orders";
import { OrderList } from "@/components/orders/OrderList";
import { OrderFilterTabs } from "@/components/orders/OrderFilterTabs";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";
import Link from "next/link";
import { Globe, ArrowUpRight, Truck } from "lucide-react";
import { formatRupiah } from "@/lib/utils/currency";

// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function WebstoreOrdersPage() {
  const orders = await getOrdersByFilter("storefront");
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="mx-auto w-full max-w-(--container-wide) min-w-0 px-3.5 py-5 sm:px-6 sm:py-8 box-border">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Pesanan Web Storefront
            </h1>
            <span className="rounded-md bg-karyalo-green/10 px-2 py-0.5 text-xs font-semibold text-karyalo-green">
              🌐 Storefront PWA Live
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            Menampilkan {orders.length} transaksi pesanan langsung dari Web Storefront pelanggan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/storefront"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border bg-warm-white px-3.5 text-xs font-semibold text-ink shadow-xs transition-colors hover:border-karyalo-green"
          >
            <Globe size={14} className="text-karyalo-green" />
            <span>Kelola Storefront CMS</span>
            <ArrowUpRight size={13} className="text-muted" />
          </Link>
        </div>
      </div>

      {/* Webstore Order Stats Highlight Card */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-warm-white p-3.5 shadow-2xs">
          <span className="text-xs text-muted">Total Omzet Webstore</span>
          <p className="mt-1 text-base sm:text-lg font-bold text-ink">{formatRupiah(totalRevenue)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-warm-white p-3.5 shadow-2xs">
          <span className="text-xs text-muted">Pesanan Aktif</span>
          <p className="mt-1 text-base sm:text-lg font-bold text-karyalo-green">{orders.length} Transaksi</p>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-border bg-warm-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Truck size={13} className="text-karyalo-green" />
            <span>Kurir Ekspedisi Aktif</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-ink">J&T Express, SiCepat, SPX, JNE</p>
        </div>
      </div>

      <SampleDataBanner note="Data pesanan Web Storefront terintegrasi langsung dengan Storefront PWA via Convex backend." />
      <OrderFilterTabs />
      <OrderList orders={orders} />
    </div>
  );
}
