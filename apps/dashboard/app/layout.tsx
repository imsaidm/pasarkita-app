import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { SessionProvider } from "@/lib/auth/session-context";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kelola Toko Pasarkita",
    template: "%s — Pasarkita",
  },
  description:
    "Kelola pesanan, produk, stok, pelanggan, dan keuangan toko Anda.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E2F5C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={inter.variable}>
      <body>          <SessionProvider>
            <AppShell>{children}</AppShell>
          </SessionProvider>      </body>
    </html>
  );
}
