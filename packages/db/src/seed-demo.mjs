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

const CATALOG = [
  { name: 'Kopi Susu Gula Aren', category: 'Minuman', price: 18_000, stock: 40 },
  { name: 'Americano', category: 'Minuman', price: 15_000, stock: 35 },
  { name: 'Teh Tarik', category: 'Minuman', price: 14_000, stock: 30 },
  { name: 'Air Mineral 600ml', category: 'Minuman', price: 5_000, stock: 120 },
  { name: 'Roti Bakar Coklat', category: 'Makanan', price: 20_000, stock: 25 },
  { name: 'Pisang Goreng', category: 'Makanan', price: 12_000, stock: 40 },
  { name: 'Nasi Goreng Spesial', category: 'Makanan', price: 28_000, stock: 20 },
  { name: 'Mie Goreng', category: 'Makanan', price: 25_000, stock: 20 },
  { name: 'Keripik Singkong', category: 'Camilan', price: 10_000, stock: 60 },
  { name: 'Kacang Telur', category: 'Camilan', price: 8_000, stock: 50 },
];

function readDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL belum diisi.');
  return url;
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

    await client.query(
      'INSERT INTO product (id, tenant_id, name, category) VALUES ($1, $2, $3, $4)',
      [productId, tenant.id, item.name, item.category],
    );
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
