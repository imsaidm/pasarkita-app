import Link from "next/link";
import { getCustomers } from "@/lib/data/customers";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";

/** PRD §17 Customers/CRM UI — list. */
// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="mx-auto max-w-(--container-wide) px-4 py-6 md:px-6 md:py-8">
      <h1 className="mb-1 text-xl font-semibold text-ink md:text-2xl">Customers</h1>
      <p className="mb-4 text-sm text-muted">{customers.length} pelanggan</p>
      <SampleDataBanner />
      <div className="overflow-hidden rounded-(--radius-card) border border-border bg-warm-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-soft-sand text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Kota</th>
              <th className="px-4 py-3 font-medium">Segmen</th>
              <th className="px-4 py-3 text-right font-medium">Total Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-soft-sand">
                <td className="px-4 py-3">
                  <Link href={`/customers/${c.id}`} className="font-medium text-karyalo-green hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted sm:table-cell">{c.city}</td>
                <td className="px-4 py-3 text-xs text-ink">{c.segment}</td>
                <td className="px-4 py-3 text-right text-ink">{c.totalOrders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
