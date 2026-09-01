import Link from "next/link";
import { getTenantConfig } from "@/lib/config/tenant";

/**
 * HOME-10 Footer. Isi lengkap (customer service, shipping, returns, dst.)
 * adalah bagian dari pembangunan Homepage di Fase 2 — di Fase 1 ini
 * fondasi struktur + link legal/help yang sudah pasti dibutuhkan di semua
 * halaman (bukan cuma homepage), supaya app shell utuh.
 */
export async function Footer() {
  const tenant = await getTenantConfig();

  return (
    <footer className="mt-16 border-t border-border bg-soft-sand pb-24 pt-10 md:pb-10">
      <div className="mx-auto grid max-w-(--container-content) gap-8 px-4 text-sm md:grid-cols-3 md:px-6">
        <div>
          <p className="font-semibold text-deep-pine">{tenant.storeName}</p>
          <p className="mt-2 text-muted">
            Bagian dari ekosistem Karyalo Omnichannel SaaS.
          </p>
        </div>

        <nav aria-label="Bantuan">
          <p className="font-medium text-ink">Bantuan</p>
          <ul className="mt-2 space-y-1.5 text-muted">
            <li><Link href="/help" className="hover:text-deep-pine">FAQ</Link></li>
            <li><Link href="/help/shipping" className="hover:text-deep-pine">Pengiriman</Link></li>
            <li><Link href="/help/returns" className="hover:text-deep-pine">Retur &amp; Refund</Link></li>
            <li><Link href="/help/payment" className="hover:text-deep-pine">Pembayaran</Link></li>
            <li><Link href="/contact" className="hover:text-deep-pine">Hubungi Kami</Link></li>
          </ul>
        </nav>

        <nav aria-label="Legal">
          <p className="font-medium text-ink">Legal</p>
          <ul className="mt-2 space-y-1.5 text-muted">
            <li><Link href="/privacy" className="hover:text-deep-pine">Kebijakan Privasi</Link></li>
            <li><Link href="/terms" className="hover:text-deep-pine">Syarat &amp; Ketentuan</Link></li>
          </ul>
        </nav>
      </div>

      <p className="mx-auto mt-8 max-w-(--container-content) px-4 text-xs text-muted md:px-6">
        © {new Date().getFullYear()} {tenant.storeName}. Prototype — belum untuk transaksi nyata.
      </p>
    </footer>
  );
}
