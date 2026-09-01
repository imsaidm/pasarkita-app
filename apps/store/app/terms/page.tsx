const DRAFT_NOTICE =
  "DRAFT — teks di halaman ini adalah boilerplate generik untuk keperluan prototype, BELUM ditinjau/disetujui tim legal Karyalo. Jangan dipakai sebagai syarat & ketentuan resmi sebelum ditinjau.";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <div className="mb-6 rounded-(--radius-card) border border-terracotta bg-terracotta-soft px-4 py-3 text-xs text-terracotta">
        {DRAFT_NOTICE}
      </div>
      <h1 className="mb-6 text-2xl font-semibold text-ink">Syarat & Ketentuan</h1>
      <div className="flex max-w-2xl flex-col gap-4 text-sm text-muted">
        <p>
          Dengan menggunakan Karyalo Store, Anda setuju untuk memberikan
          informasi yang akurat saat membuat akun atau melakukan
          pemesanan, dan bertanggung jawab atas keamanan akun Anda.
        </p>
        <p>
          Harga dan ketersediaan produk dapat berubah sewaktu-waktu tanpa
          pemberitahuan sebelumnya. Pesanan dianggap sah setelah
          pembayaran dikonfirmasi.
        </p>
        <p>
          Kebijakan retur mengikuti ketentuan pada halaman Retur & Refund.
          Karyalo Store berhak menolak pesanan yang terindikasi
          penyalahgunaan atau melanggar ketentuan ini.
        </p>
        <p>
          Karyalo Store dapat memperbarui syarat & ketentuan ini
          sewaktu-waktu; perubahan berlaku sejak dipublikasikan di
          halaman ini.
        </p>
      </div>
    </div>
  );
}
