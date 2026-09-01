import Link from "next/link";
import { Truck, RotateCcw, CreditCard, ChevronRight } from "lucide-react";

const TOPICS = [
  { href: "/help/shipping", label: "Pengiriman", icon: Truck },
  { href: "/help/returns", label: "Retur & Refund", icon: RotateCcw },
  { href: "/help/payment", label: "Pembayaran", icon: CreditCard },
];

const FAQ = [
  {
    q: "Berapa lama pesanan saya diproses?",
    a: "Pesanan biasanya diproses dalam 1x24 jam kerja sebelum diserahkan ke kurir.",
  },
  {
    q: "Apakah saya bisa mengubah alamat setelah checkout?",
    a: "Hubungi layanan pelanggan sesegera mungkin sebelum status pesanan berubah menjadi \"Dikirim\".",
  },
  {
    q: "Bagaimana cara melacak pesanan saya?",
    a: "Buka halaman Pesanan Saya di menu Akun, lalu pilih pesanan yang ingin dilacak.",
  },
];

/**
 * §27 Help Center. Konten FAQ generik untuk fashion e-commerce — bukan
 * disalin dari kebijakan Alina, ditulis ulang untuk konteks Karyalo.
 */
export default function HelpPage() {
  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <h1 className="mb-6 text-2xl font-semibold text-ink">Pusat Bantuan</h1>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {TOPICS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between rounded-(--radius-card) border border-border p-4 hover:border-deep-pine"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-ink">
              <Icon size={18} className="text-deep-pine" aria-hidden="true" />
              {label}
            </span>
            <ChevronRight size={16} className="text-muted" aria-hidden="true" />
          </Link>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-semibold text-ink">Pertanyaan Umum</h2>
      <div className="flex flex-col divide-y divide-border rounded-(--radius-card) border border-border">
        {FAQ.map((item) => (
          <details key={item.q} className="group p-4">
            <summary className="cursor-pointer list-none text-sm font-medium text-ink">
              {item.q}
            </summary>
            <p className="mt-2 text-sm text-muted">{item.a}</p>
          </details>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted">
        Masih butuh bantuan?{" "}
        <Link href="/contact" className="font-medium text-deep-pine hover:underline">
          Hubungi kami
        </Link>
        .
      </p>
    </div>
  );
}
