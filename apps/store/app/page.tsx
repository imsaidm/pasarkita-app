import { headers } from 'next/headers';
import { readSecret, readSession } from '@pasarkita/auth';
import { listCatalog } from '@pasarkita/db';

export const dynamic = 'force-dynamic';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export default async function StorePage() {
  const cookieHeader = (await headers()).get('cookie');
  const session = readSession(cookieHeader, readSecret());

  if (session === null) {
    return (
      <>
        <h1>Toko online Pasarkita</h1>
        <p className="muted">
          Halaman toko yang siap menerima pesanan &mdash; katalog, keranjang, dan pesanan yang tidak
          tenggelam di chat. Lihat contohnya tanpa daftar; isinya toko palsu, bukan toko sungguhan.
        </p>
        <form method="post" action="/api/demo">
          <button className="btn btn-primary" type="submit">
            Lihat contoh toko
          </button>
        </form>
        <h2>Punya toko sendiri</h2>
        <p className="muted small">
          Buat dan atur katalog Anda lewat{' '}
          <a href="https://dashboard.pasarkita.net">dashboard.pasarkita.net</a>.
        </p>
      </>
    );
  }

  let catalog;
  try {
    catalog = await listCatalog(session.tenantId);
  } catch {
    return (
      <>
        <h1>Toko</h1>
        <p className="notice">
          Katalog belum bisa dibaca. Muat ulang sebentar lagi &mdash; kalau tetap begini, data contoh
          kemungkinan belum disiapkan di server.
        </p>
      </>
    );
  }

  const categories = [...new Set(catalog.map((item) => item.category ?? 'Lainnya'))];

  return (
    <>
      {session.kind === 'demo' ? (
        <p className="banner">
          <strong>Contoh toko.</strong>
          <span>Produk dan harga di sini palsu, dipakai untuk memperlihatkan tampilannya.</span>
          <a className="btn small" href="/api/demo?keluar=1" style={{ marginLeft: 'auto' }}>
            Keluar
          </a>
        </p>
      ) : null}

      <h1>Katalog</h1>
      <p className="muted small">{catalog.length} produk tersedia</p>

      {categories.map((category) => (
        <section key={category}>
          <h2>{category}</h2>
          <div className="grid grid-3">
            {catalog
              .filter((item) => (item.category ?? 'Lainnya') === category)
              .map((item) => (
                <article key={item.skuId} className="cell">
                  <h3>{item.name}</h3>
                  <p className="pr" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    {rupiah.format(item.priceCents / 100)}
                  </p>
                  <p className="muted small">
                    {item.stock > 0 ? `Tersedia ${item.stock} ${item.unit}` : 'Stok habis'}
                  </p>
                </article>
              ))}
          </div>
        </section>
      ))}

      <p className="muted small" style={{ marginTop: '2rem' }}>
        Keranjang dan checkout menyusul. Yang ditampilkan sekarang adalah katalog yang dibaca
        langsung dari stok yang sama dengan kasir &mdash; angka di sini dan di{' '}
        <a href="https://pos.pasarkita.net">kasir</a> selalu sama.
      </p>
    </>
  );
}
