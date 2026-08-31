import { headers } from 'next/headers';
import { readSession, readSecret } from '@pasarkita/auth';
import { listCatalog } from '@pasarkita/db';
import { CHANNEL_LABELS, TIER_LABELS } from '@pasarkita/plan';
import Register from './Register';

export const dynamic = 'force-dynamic';

export default async function PosPage() {
  const cookieHeader = (await headers()).get('cookie');
  const session = readSession(cookieHeader, readSecret());

  if (session === null) {
    return (
      <>
        <h1>Kasir Pasarkita</h1>
        <p className="muted">
          Transaksi di tempat, tetap jalan waktu internet mati. Coba dulu tanpa daftar &mdash; yang
          dibuka adalah toko contoh berisi data palsu, bukan data toko sungguhan.
        </p>
        <form method="post" action="/api/demo">
          <button className="btn btn-primary" type="submit">
            Coba demo kasir
          </button>
        </form>
        <h2>Kalau sudah punya akun</h2>
        <p className="muted small">
          Masuk lewat <a href="https://dashboard.pasarkita.net">dashboard.pasarkita.net</a>, lalu
          kembali ke halaman ini.
        </p>
      </>
    );
  }

  const outletId = `${session.tenantId}_outlet`;
  let catalog;
  try {
    catalog = await listCatalog(session.tenantId, outletId);
  } catch {
    return (
      <>
        <h1>Kasir</h1>
        <p className="notice">
          Katalog belum bisa dibaca. Coba muat ulang sebentar lagi &mdash; kalau tetap begini,
          kemungkinan data contoh belum disiapkan di server.
        </p>
      </>
    );
  }

  return (
    <>
      {session.kind === 'demo' ? (
        <p className="banner">
          <strong>Mode demo.</strong>
          <span>
            Data ini palsu dan direset berkala. Transaksi tercatat, tapi tidak ada uang atau pesan
            sungguhan yang keluar.
          </span>
          <a className="btn small" href="/api/demo?keluar=1" style={{ marginLeft: 'auto' }}>
            Keluar
          </a>
        </p>
      ) : null}

      <h1>Kasir</h1>
      <p className="muted small">
        Paket {CHANNEL_LABELS[session.plan.channel]} &middot; {TIER_LABELS[session.plan.tier]}
        {' '}&middot; {catalog.length} produk
      </p>

      <Register items={catalog} />
    </>
  );
}
