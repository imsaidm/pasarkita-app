#!/usr/bin/env node
/**
 * Membuat toko dan akun pemiliknya.
 *
 *   PK_EMAIL=... PK_PASSWORD=... PK_TOKO="Nama Toko" \
 *     node packages/db/src/create-user.mjs
 *
 * Kata sandi dibaca dari lingkungan, bukan argumen baris perintah: argumen
 * terlihat di `ps` oleh pengguna lain di mesin yang sama, dan tersimpan di
 * riwayat shell.
 *
 * Aman diulang: menjalankan lagi dengan email yang sama akan MENGGANTI kata
 * sandinya, bukan membuat akun kedua.
 */

import { randomUUID, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import pg from 'pg';

const PARAMS = { N: 16_384, r: 8, p: 1, keyLength: 64 };

// Harus menghasilkan format yang sama persis dengan packages/auth/src/password.ts.
function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16);
    scrypt(password, salt, PARAMS.keyLength, PARAMS, (error, derived) => {
      if (error) return reject(error);
      resolve(
        ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p, salt.toString('base64'), derived.toString('base64')].join('$'),
      );
    });
  });
}

function required(name) {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} belum diisi.`);
  }
  return value.trim();
}

const CHANNELS = ['offline', 'online', 'omni'];
const TIERS = ['startup', 'middle', 'pro'];

async function main() {
  const databaseUrl = required('DATABASE_URL');
  const email = required('PK_EMAIL').toLowerCase();
  const password = process.env.PK_PASSWORD ?? '';
  const storeName = process.env.PK_TOKO ?? 'Toko Saya';
  const name = process.env.PK_NAMA ?? 'Pemilik';
  const channel = process.env.PK_CHANNEL ?? 'omni';
  const tier = process.env.PK_TIER ?? 'pro';

  if (password.length < 8) throw new Error('PK_PASSWORD minimal 8 karakter.');
  if (!CHANNELS.includes(channel)) throw new Error(`PK_CHANNEL harus salah satu dari: ${CHANNELS.join(', ')}`);
  if (!TIERS.includes(tier)) throw new Error(`PK_TIER harus salah satu dari: ${TIERS.join(', ')}`);

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT id, tenant_id FROM app_user WHERE lower(email) = $1',
      [email],
    );

    const passwordHash = await hashPassword(password);

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      await client.query('UPDATE app_user SET password_hash = $2 WHERE id = $1', [
        row.id,
        passwordHash,
      ]);
      await client.query('COMMIT');
      console.log(`Kata sandi untuk ${email} diperbarui (toko ${row.tenant_id}).`);
      return;
    }

    // Id toko diturunkan dari namanya supaya mudah dikenali di basis data,
    // dengan akhiran acak agar dua toko bernama sama tidak bertabrakan.
    const base = storeName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const tenantId = `${base || 'toko'}_${randomBytes(3).toString('hex')}`;
    if (tenantId.startsWith('demo_')) throw new Error('Nama toko tidak boleh diawali "demo".');

    await client.query(
      'INSERT INTO tenant (id, name, channel, tier, is_demo) VALUES ($1, $2, $3, $4, false)',
      [tenantId, storeName, channel, tier],
    );
    await client.query(
      `INSERT INTO outlet (id, tenant_id, name, kind) VALUES ($1, $2, 'Cabang Utama', 'outlet')`,
      [`${tenantId}_outlet`, tenantId],
    );
    await client.query(
      `INSERT INTO app_user (id, tenant_id, email, password_hash, name, role)
       VALUES ($1, $2, $3, $4, $5, 'owner')`,
      [randomUUID(), tenantId, email, passwordHash, name],
    );

    await client.query('COMMIT');
    console.log(`Toko "${storeName}" dibuat (${tenantId}), paket ${channel}-${tier}.`);
    console.log(`Akun pemilik: ${email}`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(`Gagal: ${error.message}`);
  process.exitCode = 1;
});
