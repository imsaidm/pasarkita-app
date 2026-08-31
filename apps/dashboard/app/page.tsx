import { headers } from 'next/headers';
import { readSecret, readSession } from '@pasarkita/auth';
import { countSkus } from '@pasarkita/db';
import {
  CHANNEL_LABELS,
  FEATURE_SPECS,
  TIER_LABELS,
  appsOf,
  can,
  limitsOf,
  nextPlan,
  type Feature,
} from '@pasarkita/plan';

export const dynamic = 'force-dynamic';

const APP_LINKS: Record<string, string> = {
  pos: 'https://pos.pasarkita.net',
  store: 'https://store.pasarkita.net',
  dashboard: 'https://dashboard.pasarkita.net',
};

const APP_LABELS: Record<string, string> = {
  pos: 'Kasir',
  store: 'Toko Online',
  dashboard: 'Kelola Toko',
};

function formatLimit(value: number | null, suffix: string): string {
  return value === null ? `Tanpa batas ${suffix}` : `${value.toLocaleString('id-ID')} ${suffix}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ gagal?: string }>;
}) {
  const cookieHeader = (await headers()).get('cookie');
  const session = readSession(cookieHeader, readSecret());
  const params = await searchParams;

  if (session === null) {
    return (
      <>
        <h1>Kelola Toko</h1>
        <p className="muted">
          Masuk untuk mengatur produk, stok, pesanan, dan keuangan toko Anda.
        </p>
        {params.gagal === '1' ? (
          <p className="notice" role="alert">
            Email atau kata sandi tidak cocok. Coba lagi.
          </p>
        ) : null}
        <form className="stack" method="post" action="/api/login">
          <label>
            Email
            <input type="email" name="email" autoComplete="email" required />
          </label>
          <label>
            Kata sandi
            <input type="password" name="password" autoComplete="current-password" required />
          </label>
          <button className="btn btn-primary" type="submit">
            Masuk
          </button>
        </form>
        <p className="muted small" style={{ marginTop: '1.5rem' }}>
          Belum punya akun? Coba dulu tanpa daftar di{' '}
          <a href="https://pos.pasarkita.net">kasir</a> atau{' '}
          <a href="https://store.pasarkita.net">toko online</a>.
        </p>
      </>
    );
  }

  const { plan } = session;
  const limits = limitsOf(plan);
  const upgrade = nextPlan(plan);

  let skuCount = 0;
  try {
    skuCount = await countSkus(session.tenantId);
  } catch {
    // Angka pemakaian tidak sepenting halamannya tetap terbuka.
  }

  const features = Object.keys(FEATURE_SPECS) as Feature[];
  const relevant = features.filter((f) => FEATURE_SPECS[f].channels.includes(plan.channel));

  return (
    <>
      <h1>Kelola Toko</h1>
      <p className="muted small">
        Paket <strong>{CHANNEL_LABELS[plan.channel]} &middot; {TIER_LABELS[plan.tier]}</strong>
      </p>

      <h2>Pemakaian</h2>
      <div className="grid grid-4">
        <div className="cell stat">
          <div className="label">Produk</div>
          <div className="value">
            {skuCount} <span className="muted small">/ {limits.skus}</span>
          </div>
        </div>
        <div className="cell stat">
          <div className="label">Outlet</div>
          <div className="value">{limits.outlets}</div>
        </div>
        <div className="cell stat">
          <div className="label">Pengguna</div>
          <div className="value">{limits.users === null ? '∞' : limits.users}</div>
        </div>
        <div className="cell stat">
          <div className="label">Riwayat</div>
          <div className="value">
            {limits.historyDays === null ? '∞' : `${limits.historyDays}h`}
          </div>
        </div>
      </div>

      <h2>Aplikasi dalam paket Anda</h2>
      <div className="grid grid-3">
        {appsOf(plan).map((app) => (
          <a key={app} className="cell" href={APP_LINKS[app]} style={{ textDecoration: 'none' }}>
            <h3>{APP_LABELS[app]}</h3>
            <p className="muted small">{APP_LINKS[app]?.replace('https://', '')}</p>
          </a>
        ))}
      </div>

      <h2>Fitur</h2>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Fitur</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {relevant.map((feature) => {
              const open = can(plan, feature);
              return (
                <tr key={feature}>
                  <td>{FEATURE_SPECS[feature].label}</td>
                  <td className={open ? 'open' : 'locked'}>
                    {open ? 'Aktif' : `Mulai ${TIER_LABELS[FEATURE_SPECS[feature].minTier]}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {upgrade === null ? null : (
        <p className="muted small" style={{ marginTop: '1rem' }}>
          Naik ke <strong>{TIER_LABELS[upgrade.tier]}</strong> untuk membuka fitur yang masih
          terkunci. Data ikut, tidak ada yang perlu diatur ulang.
        </p>
      )}
    </>
  );
}
