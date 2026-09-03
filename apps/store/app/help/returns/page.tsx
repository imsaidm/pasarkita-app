import { Breadcrumb } from "@/components/layout/Breadcrumb";

export default function HelpReturnsPage() {
  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <Breadcrumb items={[{ label: "Bantuan", href: "/help" }, { label: "Retur & Refund" }]} />
      <h1 className="mb-4 text-2xl font-semibold text-ink">Retur & Refund</h1>
      <div className="flex max-w-2xl flex-col gap-4 text-sm text-muted">
        <p>
          Anda dapat mengajukan retur dalam 7 hari sejak barang diterima,
          selama produk belum dipakai, masih dalam kemasan asli, dan
          disertai bukti pembelian.
        </p>
        <p>
          Setelah retur disetujui dan barang diterima kembali, refund
          diproses ke metode pembayaran awal dalam 3-7 hari kerja.
        </p>
        <p className="text-xs text-muted">
          Catatan prototype: proses pengajuan retur di aplikasi (form,
          upload foto, status) belum dibangun — informasi di halaman ini
          bersifat deskriptif saja.
        </p>
      </div>
    </div>
  );
}
