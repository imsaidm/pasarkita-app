import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';

/**
 * Hashing kata sandi dengan scrypt bawaan Node — tanpa dependensi luar.
 *
 * Format tersimpan: scrypt$N$r$p$saltBase64$hashBase64
 * Parameternya ikut disimpan supaya bisa dinaikkan nanti tanpa membuat
 * kata sandi lama tidak bisa diperiksa.
 */

// Dibungkus manual, bukan lewat promisify: overload scrypt membuat promisify
// memilih bentuk tiga argumen sehingga parameter kerja tidak bisa diberikan.
function scryptAsync(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, derived) => {
      if (error) reject(error);
      else resolve(derived);
    });
  });
}

const PARAMS = Object.freeze({ N: 16_384, r: 8, p: 1, keyLength: 64 });
const SALT_BYTES = 16;
const MIN_LENGTH = 8;

export class PasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordError';
  }
}

export function assertPasswordAcceptable(password: string): void {
  if (typeof password !== 'string' || password.length < MIN_LENGTH) {
    throw new PasswordError(`Kata sandi minimal ${MIN_LENGTH} karakter.`);
  }
  if (password.length > 1024) {
    throw new PasswordError('Kata sandi terlalu panjang.');
  }
}

export async function hashPassword(password: string): Promise<string> {
  assertPasswordAcceptable(password);
  const salt = randomBytes(SALT_BYTES);
  const derived = (await scryptAsync(password, salt, PARAMS.keyLength, {
    N: PARAMS.N,
    r: PARAMS.r,
    p: PARAMS.p,
  }));
  return [
    'scrypt',
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString('base64'),
    derived.toString('base64'),
  ].join('$');
}

/**
 * Selalu mengembalikan boolean, tidak pernah melempar untuk hash yang rusak.
 * Hash yang tidak bisa dibaca diperlakukan sebagai tidak cocok, supaya baris
 * database yang cacat tidak berubah menjadi jalan masuk.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (typeof password !== 'string' || typeof stored !== 'string') return false;

  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return false;
  // Batas atas menahan hash berisi parameter besar yang dipakai untuk membebani CPU.
  if (N > 1_048_576 || r > 32 || p > 16) return false;

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[4] ?? '', 'base64');
    expected = Buffer.from(parts[5] ?? '', 'base64');
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;

  try {
    const derived = (await scryptAsync(password, salt, expected.length, { N, r, p }));
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
