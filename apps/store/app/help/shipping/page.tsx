import { Breadcrumb } from "@/components/layout/Breadcrumb";

export default function HelpShippingPage() {
  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <Breadcrumb items={[{ label: "Bantuan", href: "/help" }, { label: "Pengiriman" }]} />
      <h1 className="mb-4 text-2xl font-semibold text-ink">Pengiriman</h1>
      <div className="flex max-w-2xl flex-col gap-4 text-sm text-muted">
        <p>
          Karyalo Store mengirim ke seluruh Indonesia melalui rekanan
          jasa kirim pilihan. Dua opsi tersedia saat checkout: Reguler
          (3-5 hari kerja) dan Express (1-2 hari kerja), dengan biaya yang
          dihitung berdasarkan tujuan pengiriman.
        </p>
        <p>
          Pesanan diproses maksimal 1x24 jam kerja setelah pembayaran
          dikonfirmasi. Anda akan menerima nomor resi untuk melacak
          pesanan begitu paket diserahkan ke kurir.
        </p>
        <p className="text-xs text-muted">
          Catatan prototype: integrasi kurir sungguhan (Biteship) belum
          tersambung — opsi dan biaya pengiriman di checkout saat ini
          adalah simulasi.
        </p>
      </div>
    </div>
  );
}
