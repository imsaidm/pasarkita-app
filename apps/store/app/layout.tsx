import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/lib/cart/cart-context";
import { WishlistProvider } from "@/lib/wishlist/wishlist-context";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Footer } from "@/components/layout/Footer";
import { ServiceWorkerRegister } from "@/components/system/ServiceWorkerRegister";

// Variabel font dipasang di <html>. Kalau className ini lupa, seluruh app
// diam-diam jatuh ke system-ui tanpa satu pun pesan error.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Toko Pasarkita",
    template: "%s — Pasarkita",
  },
  description:
    "Belanja mudah dan transparan. Stok yang Anda lihat di sini sama dengan stok di kasir toko.",
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
      <body>
        <CartProvider>
          <WishlistProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-deep-pine focus:px-4 focus:py-2 focus:text-warm-white"
            >
              Lompat ke konten utama
            </a>
            <AnnouncementBar />
            <AppHeader />
            <main id="main-content" className="min-h-[60vh] pb-20 md:pb-0">
              {children}
            </main>
            <Footer />
            <BottomNavigation />
            <ServiceWorkerRegister />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
