import type { Metadata } from 'next';
import '@pasarkita/ui/styles.css';

export const metadata: Metadata = {
  title: 'Kelola Toko Pasarkita',
  description: 'Kelola produk, stok, pesanan, dan keuangan toko Anda.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div className="shell">
          <header className="topbar">
            <span className="brand">
              Pasarkita <span>Kelola Toko</span>
            </span>
            <nav>
              <a href="https://pasarkita.net">Beranda</a>
              <a href="https://store.pasarkita.net">Toko</a>
              <a href="https://pos.pasarkita.net">Kasir</a>
              <a href="https://dashboard.pasarkita.net">Kelola</a>
            </nav>
          </header>
          <main>{children}</main>
          <footer>Pasarkita &mdash; pasarkita.net</footer>
        </div>
      </body>
    </html>
  );
}
