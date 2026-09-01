/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  // next/image dipakai di banyak halaman. Pada output standalone tanpa
  // sharp, permintaan gambar gagal 500 di produksi tanpa error saat build.
  images: { unoptimized: true },
  // Paket lokal diekspor sebagai sumber TypeScript, jadi harus ikut ditranspilasi.
  transpilePackages: ['@pasarkita/plan', '@pasarkita/auth', '@pasarkita/db', '@pasarkita/ui'],
  outputFileTracingRoot: new URL('../../', import.meta.url).pathname,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
