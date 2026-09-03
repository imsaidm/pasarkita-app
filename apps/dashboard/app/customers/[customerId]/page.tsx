import { notFound } from "next/navigation";
import { User } from "lucide-react";
import { getCustomerById, getCustomers } from "@/lib/data/customers";
import { PIIMaskedField } from "@/components/customers/PIIMaskedField";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";


/** PRD §17 — profil pelanggan + PII masking. */
// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  const customer = await getCustomerById(customerId);
  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-6 md:px-6 md:py-8">
      <SampleDataBanner />
      <div className="mb-4 flex items-center gap-4 rounded-(--radius-card) border border-border bg-warm-white p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-soft-sage text-deep-pine">
          <User size={26} aria-hidden="true" />
        </div>
        <div>
          <p className="text-lg font-semibold text-ink">{customer.name}</p>
          <p className="text-sm text-muted">{customer.city} · Bergabung {customer.joinedAtLabel} · Segmen {customer.segment}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-(--radius-card) border border-border bg-warm-white p-4">
        <h2 className="mb-1 text-sm font-semibold text-ink">Kontak (PII)</h2>
        <PIIMaskedField label="Email" value={customer.maskedEmail} />
        <PIIMaskedField label="Telepon" value={customer.maskedPhone} />
      </div>

      <div className="mt-4 rounded-(--radius-card) border border-dashed border-border bg-soft-sand p-4 text-sm text-muted">
        Timeline order pelanggan (`CustomerTimeline`, §39) belum dibangun — akan menampilkan riwayat order dari OMS begitu tersambung (Fase 5).
      </div>
    </div>
  );
}
