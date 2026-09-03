import { getAllOrders } from "@/lib/data/orders";
import { OrderList } from "@/components/orders/OrderList";
import { OrderFilterTabs } from "@/components/orders/OrderFilterTabs";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";

/** PRD §14.2 Order List — semua order. */
// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="mx-auto w-full max-w-(--container-wide) min-w-0 px-3.5 py-5 sm:px-6 sm:py-8 box-border">
      <div className="mb-4">
        <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">Daftar Pesanan</h1>
        <p className="mt-0.5 text-xs text-muted sm:text-sm">{orders.length} total transaksi masuk</p>
      </div>
      <SampleDataBanner />
      <OrderFilterTabs />
      <OrderList orders={orders} />
    </div>
  );
}
