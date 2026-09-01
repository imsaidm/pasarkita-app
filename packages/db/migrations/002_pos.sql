-- Pasarkita — kebutuhan kasir
--
-- Dua hal yang harus ada sebelum kasir dipakai sungguhan:
--   1. Idempotency. Kasir menyimpan transaksi ke antrean lokal saat internet
--      mati, lalu mengirimnya lagi saat tersambung. Pengiriman ulang tidak
--      boleh menghasilkan transaksi kedua.
--   2. Shift. Uang di laci harus bisa dipertanggungjawabkan per giliran jaga.

BEGIN;

-- ---------------------------------------------------------------- idempotency

-- Kunci dari sisi kasir. Dua permintaan dengan kunci sama adalah satu
-- transaksi, berapa kali pun dikirim ulang.
ALTER TABLE "order" ADD COLUMN idempotency_key text;

CREATE UNIQUE INDEX order_idempotency_idx
  ON "order" (tenant_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ---------------------------------------------------------------- shift kasir

CREATE TABLE cash_shift (
  id             text PRIMARY KEY,
  tenant_id      text NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  outlet_id      text NOT NULL REFERENCES outlet(id) ON DELETE RESTRICT,
  opened_by      text REFERENCES app_user(id) ON DELETE SET NULL,
  opened_at      timestamptz NOT NULL DEFAULT now(),
  -- Uang tunai yang ada di laci saat kasir dibuka.
  opening_cents  bigint NOT NULL DEFAULT 0 CHECK (opening_cents >= 0),
  closed_at      timestamptz,
  -- Hasil hitung fisik saat tutup. NULL selama shift masih berjalan.
  counted_cents  bigint CHECK (counted_cents IS NULL OR counted_cents >= 0),
  note           text
);

CREATE INDEX cash_shift_open_idx ON cash_shift (tenant_id, outlet_id)
  WHERE closed_at IS NULL;

-- Satu outlet hanya boleh punya satu shift terbuka. Dua kasir menghitung laci
-- yang sama pada waktu bersamaan selalu berakhir dengan selisih yang tidak
-- bisa dijelaskan.
CREATE UNIQUE INDEX cash_shift_one_open_per_outlet
  ON cash_shift (tenant_id, outlet_id)
  WHERE closed_at IS NULL;

ALTER TABLE "order" ADD COLUMN shift_id text REFERENCES cash_shift(id) ON DELETE SET NULL;
CREATE INDEX order_shift_idx ON "order" (shift_id) WHERE shift_id IS NOT NULL;

-- ---------------------------------------------------------------- pembayaran

ALTER TABLE "order" ADD COLUMN payment_method text
  CHECK (payment_method IS NULL OR payment_method IN ('cash', 'qris', 'card', 'transfer'));

-- Uang yang diserahkan pembeli. Kembalian selalu dihitung ulang dari sini
-- dan total, tidak pernah disimpan sebagai angka tersendiri yang bisa
-- berbeda dari hasil hitung.
ALTER TABLE "order" ADD COLUMN tendered_cents bigint
  CHECK (tendered_cents IS NULL OR tendered_cents >= 0);

INSERT INTO schema_migration (id) VALUES ('002_pos');

COMMIT;
