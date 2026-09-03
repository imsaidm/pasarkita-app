import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Variabel font dipasang di <html>. Kalau className ini lupa dipasang,
// seluruh app diam-diam jatuh ke system-ui tanpa satu pun error.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Kasir Pasarkita',
  description: 'Kasir Pasarkita — transaksi di tempat, tetap jalan tanpa internet.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
