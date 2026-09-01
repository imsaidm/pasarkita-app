import { Breadcrumb } from "@/components/layout/Breadcrumb";

export default function HelpPaymentPage() {
  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <Breadcrumb items={[{ label: "Bantuan", href: "/help" }, { label: "Pembayaran" }]} />
      <h1 className="mb-4 text-2xl font-semibold text-ink">Pembayaran</h1>
      <div className="flex max-w-2xl flex-col gap-4 text-sm text-muted">
        <p>
          Karyalo Store akan mendukung transfer bank dan e-wallet sebagai
          metode pembayaran utama. Semua transaksi diproses melalui
          payment gateway pihak ketiga untuk keamanan data pembayaran
          Anda.
        </p>
        <p className="text-xs text-muted">
          Catatan prototype: integrasi payment gateway sungguhan (DOKU)
          belum tersambung — opsi pembayaran di checkout saat ini adalah
          simulasi, tidak ada transaksi nyata yang diproses.
        </p>
      </div>
    </div>
  );
}
