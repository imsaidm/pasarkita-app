#!/usr/bin/env node
/**
 * Menjalankan migrasi yang belum pernah diterapkan, berurutan menurut nama file.
 *
 * Sengaja ditulis sebagai .mjs tanpa langkah build supaya bisa dipanggil
 * langsung di server saat rilis: `node packages/db/src/migrate.mjs`.
 */

import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

function readDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL belum diisi. Salin .env.example ke .env, atau muat secrets.env di server.',
    );
  }
  return url;
}

async function appliedIds(client) {
  // Tabel pencatat migrasi dibuat oleh migrasi pertama, jadi belum tentu ada.
  const exists = await client.query(
    `SELECT to_regclass('public.schema_migration') IS NOT NULL AS present`,
  );
  if (!exists.rows[0]?.present) return new Set();
  const { rows } = await client.query('SELECT id FROM schema_migration');
  return new Set(rows.map((row) => row.id));
}

async function main() {
  const client = new pg.Client({ connectionString: readDatabaseUrl() });
  await client.connect();

  try {
    const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();
    if (files.length === 0) {
      console.log('Tidak ada berkas migrasi.');
      return;
    }

    const done = await appliedIds(client);
    let applied = 0;

    for (const file of files) {
      const id = file.replace(/\.sql$/, '');
      if (done.has(id)) {
        console.log(`  lewati  ${id} (sudah diterapkan)`);
        continue;
      }
      const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
      process.stdout.write(`  jalan   ${id} ... `);
      // Setiap berkas membungkus dirinya dengan BEGIN/COMMIT, jadi kegagalan
      // di tengah tidak meninggalkan skema separuh jadi.
      await client.query(sql);
      console.log('selesai');
      applied += 1;
    }

    console.log(
      applied === 0 ? 'Skema sudah paling baru.' : `${applied} migrasi diterapkan.`,
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(`\nMigrasi gagal: ${error.message}`);
  process.exitCode = 1;
});
