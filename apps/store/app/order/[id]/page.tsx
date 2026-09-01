import { notFound } from "next/navigation";
import { getOrderById, getAllOrders } from "@/lib/data/orders";
import { OrderDetail } from "@/components/order/OrderDetail";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

// dynamicParams default true — order id Convex sungguhan yang tidak masuk
// daftar build-time ini tetap bisa diakses on-demand.
export async function generateStaticParams() {
  const orders = await getAllOrders();
  return orders.map((o) => ({ id: o.id }));
}

/**
 * §23 Order Tracking — akses langsung via link (mis. dari email/WA
 * konfirmasi), beda dari /account/orders/[id] yang diakses via daftar
 * akun. Isinya sama (OrderDetail), datanya masih mock (lib/data/orders.ts).
 */
export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <Breadcrumb items={[{ label: "Lacak Pesanan" }]} />
      <OrderDetail order={order} />
    </div>
  );
}
