import Link from "next/link";
import { FileCheck2, ArrowLeft } from "lucide-react";

// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default function TermsOfServicePage() {
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
          <FileCheck2 size={24} aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider">Syarat & Ketentuan Layanan</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-deep-pine md:text-3xl">
          Ketentuan Layanan (Terms of Service)
        </h1>
        <p className="mt-2 text-sm text-muted">
          Terakhir diperbarui: 31 Agustus 2026 • Penggunaan Platform Karyalo Manage & Integrasi Multi-channel.
        </p>
      </header>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-ink">
        <section className="rounded-(--radius-card) border border-border bg-warm-white p-6 shadow-xs">
          <h2 className="text-base font-semibold text-deep-pine">1. Penerimaan Ketentuan</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Dengan mengakses atau menggunakan platform Karyalo Manage PWA dan layanan integrasi API (termasuk Shopee Open Platform API Connector), Anda menyetujui untuk terikat oleh Ketentuan Layanan ini serta seluruh kebijakan operasional yang berlaku.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-deep-pine">2. Penggunaan Layanan API Marketplace</h2>
          <p className="text-xs leading-relaxed text-muted">
            Pengguna dan merchant yang menghubungkan akun Shopee Open Platform bertanggung jawab menjaga kerahasiaan kredensial Partner ID, Partner Key, dan Authorization Code. Karyalo tidak bertanggung jawab atas kerugian operasional akibat kelalaian pembagian kredensial oleh pengguna.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-deep-pine">3. Kepatuhan Kebijakan Platform Shopee</h2>
          <p className="text-xs leading-relaxed text-muted">
            Seluruh transaksi, pencetakan resi kurir, dan pembaruan stok yang dilakukan melalui modul Shopee API wajib mematuhi aturan Shopee Merchant Agreement dan Shopee Open Platform Developer Policy. Penyalahgunaan API untuk aktivitas di luar batas yang diizinkan dilarang keras.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-deep-pine">4. Batasan Tanggung Jawab & Uptime</h2>
          <p className="text-xs leading-relaxed text-muted">
            Platform Karyalo berusaha memberikan ketersediaan layanan sistem terbaik. Keterlambatan sinkronisasi data akibat gangguan jaringan pihak ketiga atau masa pemeliharaan server Shopee/mitra logistik berada di luar kendali langsung Karyalo.
          </p>
        </section>
      </div>
    </div>
  );
}
