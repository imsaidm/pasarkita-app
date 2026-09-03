#!/usr/bin/env node
/**
 * Mengisi ulang tenant demo dengan data palsu.
 *
 * Dipanggil saat rilis dan oleh cron berkala. Aman dijalankan berulang:
 * seluruh isi tenant demo dihapus lebih dulu, lalu dibangun lagi dari nol.
 *
 * Hanya menyentuh tenant ber-prefix demo_. Ada penjaga eksplisit di bawah
 * supaya tidak pernah ada kemungkinan menghapus data toko sungguhan.
 */

import pg from 'pg';

const DEMO_TENANTS = [
  { id: 'demo_pos', name: 'Warung Demo', channel: 'omni', tier: 'middle' },
  { id: 'demo_store', name: 'Toko Demo', channel: 'omni', tier: 'middle' },
];

/**
 * Katalog contoh.
 *
 * Nama berkas foto sengaja diturunkan dari nama produk (slug), dan berkasnya
 * memang ada di `apps/store/public/images/products/`. Katalog contoh yang
 * fotonya tidak ada membuat toko demo terlihat rusak — dan itu hal pertama
 * yang dilihat orang.
 */
const CATALOG = [
  { name: 'Blouse Linen Wanita — Krem', category: 'Wanita', price: 189_000, stock: 24, ringkas: 'Blouse linen ringan, adem dipakai harian.' },
  { name: 'Dress Midi Rayon — Navy', category: 'Wanita', price: 259_000, stock: 15, ringkas: 'Dress midi rayon jatuh, cocok untuk acara santai.' },
  { name: 'Outer Cardigan Wanita — Sage', category: 'Wanita', price: 219_000, stock: 18, ringkas: 'Cardigan rajut halus, hangat tanpa gerah.' },
  { name: 'Rok Plisket Wanita — Hitam', category: 'Wanita', price: 175_000, stock: 22, ringkas: 'Rok plisket jatuh rapi, mudah dipadukan.' },

  { name: 'Kemeja Katun Pria — Putih', category: 'Pria', price: 199_000, stock: 30, ringkas: 'Kemeja katun rapi untuk kerja dan acara formal.' },
  { name: 'Kaos Polos Pria — Navy', category: 'Pria', price: 89_000, stock: 60, ringkas: 'Kaos katun combed, potongan reguler.' },
  { name: 'Celana Chino Pria — Khaki', category: 'Pria', price: 249_000, stock: 20, ringkas: 'Chino bahan twill, tidak mudah kusut.' },
  { name: 'Jaket Denim Pria — Biru', category: 'Pria', price: 349_000, stock: 12, ringkas: 'Jaket denim klasik, makin bagus makin sering dipakai.' },

  { name: 'Sneakers Canvas — Putih', category: 'Sepatu', price: 299_000, stock: 25, ringkas: 'Sneakers kanvas ringan untuk harian.' },
  { name: 'Flat Shoes Wanita — Hitam', category: 'Sepatu', price: 229_000, stock: 20, ringkas: 'Flat shoes empuk, nyaman dipakai seharian.' },
  { name: 'Boots Chelsea — Cokelat', category: 'Sepatu', price: 459_000, stock: 8, ringkas: 'Chelsea boots kulit sintetis, mudah dilepas pasang.' },
  { name: 'Sandal Slide — Krem', category: 'Sepatu', price: 119_000, stock: 40, ringkas: 'Sandal slide empuk untuk santai.' },

  { name: 'Tote Bag Kanvas — Natural', category: 'Tas', price: 149_000, stock: 35, ringkas: 'Tote kanvas tebal, muat laptop 14 inci.' },
  { name: 'Ransel Harian — Navy', category: 'Tas', price: 329_000, stock: 16, ringkas: 'Ransel harian dengan sekat laptop berlapis.' },
  { name: 'Sling Bag Mini — Terracotta', category: 'Tas', price: 139_000, stock: 28, ringkas: 'Sling bag ringkas untuk barang seperlunya.' },

  { name: 'Jam Tangan Minimalis — Navy', category: 'Aksesoris', price: 399_000, stock: 10, ringkas: 'Jam tangan bermuka bersih, tali kulit.' },
  { name: 'Kacamata Hitam Bulat', category: 'Aksesoris', price: 159_000, stock: 24, ringkas: 'Kacamata hitam bingkai bulat dengan lensa UV400.' },
  { name: 'Scarf Motif Earth Tone', category: 'Aksesoris', price: 99_000, stock: 30, ringkas: 'Scarf bermotif hangat, bahan jatuh dan lembut.' },
];

function readDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL belum diisi.');
  return url;
}

/** Harus menghasilkan slug yang identik dengan migrasi 003 dan storefront.ts. */
function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function assertDemo(tenantId) {
  if (!tenantId.startsWith('demo_')) {
    throw new Error(
      `Penolakan keras: seed demo diminta menyentuh "${tenantId}" yang bukan tenant demo.`,
    );
  }
}

async function purgeTenant(client, tenantId) {
  assertDemo(tenantId);
  // Buku besar bersifat append-only. Reset demo adalah satu-satunya jalur
  // yang boleh menghapusnya, dan izinnya dinyalakan sesaat di sini saja.
  await client.query("SELECT set_config('app.allow_purge', 'on', true)");
  await client.query('DELETE FROM stock_ledger WHERE tenant_id = $1', [tenantId]);
  await client.query('DELETE FROM cash_entry WHERE tenant_id = $1', [tenantId]);
  await client.query("SELECT set_config('app.allow_purge', 'off', true)");

  await client.query(
    'DELETE FROM order_line WHERE order_id IN (SELECT id FROM "order" WHERE tenant_id = $1)',
    [tenantId],
  );
  await client.query('DELETE FROM "order" WHERE tenant_id = $1', [tenantId]);
  await client.query(
    'DELETE FROM sku WHERE tenant_id = $1',
    [tenantId],
  );
  await client.query(
    'DELETE FROM variant WHERE product_id IN (SELECT id FROM product WHERE tenant_id = $1)',
    [tenantId],
  );
  await client.query('DELETE FROM product WHERE tenant_id = $1', [tenantId]);
  await client.query('DELETE FROM customer WHERE tenant_id = $1', [tenantId]);
  await client.query('DELETE FROM outlet WHERE tenant_id = $1', [tenantId]);
  await client.query('DELETE FROM app_user WHERE tenant_id = $1', [tenantId]);
}

async function seedTenant(client, tenant) {
  assertDemo(tenant.id);

  await client.query(
    `INSERT INTO tenant (id, name, channel, tier, is_demo)
     VALUES ($1, $2, $3, $4, true)
     ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name,
       channel = EXCLUDED.channel, tier = EXCLUDED.tier`,
    [tenant.id, tenant.name, tenant.channel, tenant.tier],
  );

  const outletId = `${tenant.id}_outlet`;
  await client.query(
    `INSERT INTO outlet (id, tenant_id, name, kind) VALUES ($1, $2, $3, 'outlet')`,
    [outletId, tenant.id, 'Cabang Utama'],
  );

  let index = 0;
  for (const item of CATALOG) {
    index += 1;
    const productId = `${tenant.id}_p${index}`;
    const variantId = `${tenant.id}_v${index}`;
    const skuId = `${tenant.id}_s${index}`;

    // Slug wajib sejak migrasi 003 — setiap rute toko online dialamati
    // dengannya. Indeks unik per tenant, dan katalog contoh tidak punya nama
    // kembar, jadi tidak perlu pembeda urutan di sini.
    const slug = slugify(item.name);
    await client.query(
      `INSERT INTO product (id, tenant_id, name, category, slug, short_description, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        productId,
        tenant.id,
        item.name,
        item.category,
        slug,
        item.ringkas ?? '',
        item.ringkas ?? '',
      ],
    );

    // Dua foto per produk, urutan menentukan mana yang tampil di kartu.
    // Nama berkasnya mengikuti slug; kalau slug berubah, fotonya ikut hilang.
    for (const [index, suffix] of ['', '-2'].entries()) {
      await client.query(
        `INSERT INTO product_image (tenant_id, product_id, url, sort)
         VALUES ($1, $2, $3, $4)`,
        [tenant.id, productId, `/images/products/product-${slug}${suffix}.jpg`, index],
      );
    }
    await client.query('INSERT INTO variant (id, product_id) VALUES ($1, $2)', [
      variantId,
      productId,
    ]);
    await client.query(
      `INSERT INTO sku (id, tenant_id, variant_id, code, price_cents, unit)
       VALUES ($1, $2, $3, $4, $5, 'pcs')`,
      [skuId, tenant.id, variantId, `DEMO-${String(index).padStart(3, '0')}`, item.price],
    );
    await client.query(
      `INSERT INTO stock_ledger (tenant_id, sku_id, outlet_id, delta, reason)
       VALUES ($1, $2, $3, $4, 'opening')`,
      [tenant.id, skuId, outletId, item.stock],
    );
  }

  return { outletId, skuCount: CATALOG.length };
}

async function main() {
  const client = new pg.Client({ connectionString: readDatabaseUrl() });
  await client.connect();

  try {
    for (const tenant of DEMO_TENANTS) {
      await client.query('BEGIN');
      try {
        await purgeTenant(client, tenant.id);
        const result = await seedTenant(client, tenant);
        await client.query('COMMIT');
        console.log(
          `  ${tenant.id.padEnd(12)} direset — ${result.skuCount} produk, outlet ${result.outletId}`,
        );
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
    console.log('Tenant demo siap.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(`\nSeed demo gagal: ${error.message}`);
  process.exitCode = 1;
});
