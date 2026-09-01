import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Variabel font dipasang di <html>. Kalau className ini lupa dipasang,
// seluruh app diam-diam jatuh ke system-ui tanpa satu pun error.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Toko Pasarkita',
  description: 'Toko online Pasarkita — katalog, keranjang, dan pesanan.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
