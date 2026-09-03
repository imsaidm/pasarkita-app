const DRAFT_NOTICE =
  "DRAFT — teks di halaman ini adalah boilerplate generik untuk keperluan prototype, BELUM ditinjau/disetujui tim legal Karyalo. Jangan dipakai sebagai kebijakan resmi sebelum ditinjau.";

/**
 * §45 Privacy. Isi halaman ini SENGAJA generik/boilerplate, bukan
 * kebijakan final — lihat DRAFT_NOTICE di atas, ditampilkan jelas di UI
 * juga supaya tidak ada yang salah kira ini sudah final.
 */
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <div className="mb-6 rounded-(--radius-card) border border-terracotta bg-terracotta-soft px-4 py-3 text-xs text-terracotta">
        {DRAFT_NOTICE}
      </div>
      <h1 className="mb-6 text-2xl font-semibold text-ink">Kebijakan Privasi</h1>
      <div className="flex max-w-2xl flex-col gap-4 text-sm text-muted">
        <p>
          Karyalo Store mengumpulkan data yang Anda berikan saat membuat
          akun, melakukan pemesanan, atau menghubungi layanan pelanggan —
          seperti nama, alamat, nomor telepon, dan riwayat transaksi.
        </p>
        <p>
          Data digunakan untuk memproses pesanan, komunikasi terkait
          transaksi, dan peningkatan layanan. Kami tidak menjual data
          pribadi Anda kepada pihak ketiga untuk kepentingan pemasaran.
        </p>
        <p>
          Data dapat dibagikan kepada mitra operasional yang diperlukan
          untuk memproses pesanan Anda (mis. jasa kirim, payment
          gateway), sebatas yang diperlukan untuk layanan tersebut.
        </p>
        <p>
          Anda dapat meminta akses, koreksi, atau penghapusan data
          pribadi Anda dengan menghubungi kami melalui halaman Kontak.
        </p>
      </div>
    </div>
  );
}
