import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, Database, EyeOff, Server, FileText } from "lucide-react";

// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6 md:py-12">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>

      <header className="mb-8 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-karyalo-green">
          <ShieldCheck size={24} aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider">Kepatuhan Keamanan & Privasi</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-deep-pine md:text-3xl">
          Kebijakan Privasi (Privacy Policy)
        </h1>
        <p className="mt-2 text-sm text-muted">
          Terakhir diperbarui: 31 Agustus 2026 • Berlaku untuk Platform Karyalo Commerce & Integrasi API Marketplace.
        </p>
      </header>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-ink">
        {/* Ringkasan Kepatuhan */}
        <section className="rounded-(--radius-card) border border-border bg-warm-white p-6 shadow-xs">
          <h2 className="text-base font-semibold text-deep-pine">1. Komitmen Perlindungan Data</h2>
          <p className="mt-2 text-muted">
            Karyalo Manage (&quot;Platform&quot;) berkomitmen melindungi privasi pengguna, merchant, dan pembeli sesuai dengan <strong>Undang-Undang Republik Indonesia No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP)</strong> serta <strong>Shopee Open Platform Data Protection Policy</strong>.
          </p>
        </section>

        {/* Data yang Diproses */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-deep-pine">2. Data yang Dikumpulkan & Diproses Melalui API</h2>
          <p className="text-muted">
            Saat toko terhubung dengan Shopee Open Platform API atau Storefront Karyalo, Platform memproses data transaksi semata-mata untuk keperluan operasional fulfillment:
          </p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <li className="flex items-start gap-3 rounded-xl border border-border bg-warm-white p-4">
              <Database size={18} className="mt-0.5 shrink-0 text-karyalo-green" aria-hidden="true" />
              <div>
                <strong className="block font-medium text-ink">Data Pesanan & Produk</strong>
                <span className="text-xs text-muted">Nomor pesanan, rincian SKU varian, kuantitas produk, dan total pembayaran.</span>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-border bg-warm-white p-4">
              <EyeOff size={18} className="mt-0.5 shrink-0 text-karyalo-green" aria-hidden="true" />
              <div>
                <strong className="block font-medium text-ink">Data Pribadi Pembeli (PII)</strong>
                <span className="text-xs text-muted">Nama penerima, alamat pengiriman, dan nomor kontak yang di-masking secara otomatis pada UI.</span>
              </div>
            </li>
          </ul>
        </section>

        {/* Tujuan Pemrosesan */}
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-deep-pine">3. Tujuan Penggunaan Data Shopee API</h2>
          <p className="text-muted">
            Data yang diterima dari Shopee Open Platform OpenAPI (v2.order, v2.product, v2.logistics) <strong>hanya digunakan untuk</strong>:
          </p>
          <ol className="list-decimal space-y-1.5 pl-5 text-muted">
            <li>Memproses dan memperbarui status pesanan dari Shopee ke sistem inventori internal toko.</li>
            <li>Melakukan sinkronisasi pengurangan stok secara otomatis guna mencegah pesanan gagal akibat stok kosong (*out of stock*).</li>
            <li>Menerbitkan nomor resi pengiriman dan mencetak label resi logistik (Shopee Xpress, J&T, SiCepat).</li>
            <li>Menampilkan metrik agregat penjualan internal merchant tanpa menjual atau membagikan data kepada pihak ketiga.</li>
          </ol>
        </section>

        {/* Keamanan & Enkripsi */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-deep-pine">4. Standar Keamanan & Enkripsi</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-warm-white p-4">
              <Lock size={18} className="mt-0.5 shrink-0 text-karyalo-green" aria-hidden="true" />
              <div>
                <strong className="block font-medium text-ink">Enkripsi Data Transit (In-Transit)</strong>
                <span className="text-xs text-muted">Seluruh komunikasi data API dan webhook menggunakan protokol TLS 1.3 / HTTPS dengan enkripsi SHA-256.</span>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-warm-white p-4">
              <Server size={18} className="mt-0.5 shrink-0 text-karyalo-green" aria-hidden="true" />
              <div>
                <strong className="block font-medium text-ink">Kontrol Akses Berbasis Peran (RBAC)</strong>
                <span className="text-xs text-muted">Akses ke data pelanggan dibatasi ketat melalui capability matrix (3 role inti UMKM) dan pencatatan audit log.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Hak Subjek Data & Kontak */}
        <section className="rounded-(--radius-card) border border-border bg-soft-sand/60 p-6">
          <div className="flex items-center gap-2 text-deep-pine">
            <FileText size={18} aria-hidden="true" />
            <h2 className="text-base font-semibold">5. Permintaan Penghapusan Data & Kontak</h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Merchant dan pengguna berhak mencabut otorisasi toko (*de-authorize*) sewaktu-waktu melalui dashboard atau Shopee Seller Center. Saat token dicabut, sistem otomatis menghentikan penarikan data. Untuk pertanyaan privasi data, hubungi tim perlindungan data Karyalo di <code className="font-mono text-karyalo-green">privacy@karyalo.com</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
