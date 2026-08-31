import pg from 'pg';

/**
 * Satu pool per proses. Semua kueri lewat sini supaya penyaringan tenant
 * tidak pernah terlewat di satu tempat lalu bocor.
 */

let pool: pg.Pool | null = null;

export class DbError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'DbError';
  }
}

function readDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new DbError('DATABASE_URL belum diisi.');
  }
  return url;
}

export function getPool(): pg.Pool {
  if (pool === null) {
    pool = new pg.Pool({
      connectionString: readDatabaseUrl(),
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
    pool.on('error', (error) => {
      // Koneksi menganggur yang putus tidak boleh menjatuhkan proses.
      console.error('[db] koneksi menganggur bermasalah:', error.message);
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool !== null) {
    await pool.end();
    pool = null;
  }
}

export type Row = Record<string, unknown>;

export async function query<T extends Row = Row>(
  sql: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  try {
    const result = await getPool().query<T>(sql, params as unknown[]);
    return result.rows;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new DbError(`Kueri gagal: ${detail}`, { cause: error });
  }
}

export async function queryOne<T extends Row = Row>(
  sql: string,
  params: readonly unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/**
 * Menjalankan beberapa kueri dalam satu transaksi. Kegagalan apa pun
 * membatalkan seluruhnya.
 */
export async function transaction<T>(
  work: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {
      // Rollback yang gagal tidak boleh menutupi kesalahan aslinya.
    });
    const detail = error instanceof Error ? error.message : String(error);
    throw new DbError(`Transaksi dibatalkan: ${detail}`, { cause: error });
  } finally {
    client.release();
  }
}
