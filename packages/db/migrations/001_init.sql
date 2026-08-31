-- Pasarkita — skema awal
--
-- Dua aturan yang membentuk skema ini:
--   1. Stok dan uang adalah buku besar (append-only), bukan kolom angka.
--      Stok saat ini selalu hasil penjumlahan, tidak pernah hasil UPDATE.
--   2. Stok melekat pada (sku, lokasi), bukan pada produk. Ini yang membuat
--      multi-outlet dan multi-gudang jalan tanpa membongkar ulang skema.

BEGIN;

CREATE TABLE IF NOT EXISTS schema_migration (
  id          text PRIMARY KEY,
  applied_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------- tenant

CREATE TABLE tenant (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  -- Paket: dibaca ketiga aplikasi. Naik tier = ubah satu baris di sini.
  channel     text NOT NULL CHECK (channel IN ('offline', 'online', 'omni')),
  tier        text NOT NULL CHECK (tier IN ('startup', 'middle', 'pro')),
  -- Tenant demo berisi data palsu dan direset berkala.
  is_demo     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Tenant demo wajib memakai prefix demo_ supaya penjaga di lapisan aplikasi
-- bisa mengenalinya hanya dari id, tanpa query tambahan.
ALTER TABLE tenant ADD CONSTRAINT tenant_demo_prefix
  CHECK ((is_demo AND id LIKE 'demo\_%') OR (NOT is_demo AND id NOT LIKE 'demo\_%'));

CREATE TABLE app_user (
  id             text PRIMARY KEY,
  tenant_id      text NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  email          text NOT NULL,
  password_hash  text NOT NULL,
  name           text NOT NULL,
  role           text NOT NULL CHECK (role IN ('owner', 'staff')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email)
);
CREATE INDEX app_user_tenant_idx ON app_user (tenant_id);

-- ---------------------------------------------------------------- lokasi

CREATE TABLE outlet (
  id          text PRIMARY KEY,
  tenant_id   text NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  name        text NOT NULL,
  kind        text NOT NULL DEFAULT 'outlet' CHECK (kind IN ('outlet', 'warehouse')),
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX outlet_tenant_idx ON outlet (tenant_id);

-- ---------------------------------------------------------------- katalog

CREATE TABLE product (
  id          text PRIMARY KEY,
  tenant_id   text NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  name        text NOT NULL,
  category    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_tenant_idx ON product (tenant_id);

-- Produk tanpa varian tetap punya satu baris varian bernama 'Standar',
-- supaya SKU selalu menggantung di tempat yang sama.
CREATE TABLE variant (
  id          text PRIMARY KEY,
  product_id  text NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  name        text NOT NULL DEFAULT 'Standar',
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX variant_product_idx ON variant (product_id);

CREATE TABLE sku (
  id           text PRIMARY KEY,
  tenant_id    text NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  variant_id   text NOT NULL REFERENCES variant(id) ON DELETE CASCADE,
  code         text NOT NULL,
  -- Rupiah disimpan sebagai bilangan bulat. Jangan pernah pakai float untuk uang.
  price_cents  bigint NOT NULL CHECK (price_cents >= 0),
  unit         text NOT NULL DEFAULT 'pcs',
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);
CREATE INDEX sku_tenant_idx ON sku (tenant_id);

-- ---------------------------------------------------------------- pelanggan

CREATE TABLE customer (
  id          text PRIMARY KEY,
  tenant_id   text NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  name        text NOT NULL,
  phone       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX customer_tenant_idx ON customer (tenant_id);

-- ---------------------------------------------------------------- pesanan

CREATE TABLE "order" (
  id           text PRIMARY KEY,
  tenant_id    text NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  -- Satu bentuk pesanan untuk semua asal. Kasir dan toko online sama saja.
  channel      text NOT NULL CHECK (channel IN ('pos', 'store')),
  outlet_id    text REFERENCES outlet(id) ON DELETE SET NULL,
  customer_id  text REFERENCES customer(id) ON DELETE SET NULL,
  status       text NOT NULL DEFAULT 'paid'
               CHECK (status IN ('draft', 'paid', 'cancelled', 'returned')),
  total_cents  bigint NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_tenant_created_idx ON "order" (tenant_id, created_at DESC);

CREATE TABLE order_line (
  id                text PRIMARY KEY,
  order_id          text NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
  sku_id            text NOT NULL REFERENCES sku(id),
  qty               integer NOT NULL CHECK (qty <> 0),
  unit_price_cents  bigint NOT NULL CHECK (unit_price_cents >= 0)
);
CREATE INDEX order_line_order_idx ON order_line (order_id);

-- ---------------------------------------------------------------- buku besar

-- Setiap pergerakan stok satu baris baru. Tidak pernah diubah, tidak pernah
-- dihapus. Selisih stok selalu bisa ditelusuri asalnya.
CREATE TABLE stock_ledger (
  id          bigserial PRIMARY KEY,
  tenant_id   text NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  -- RESTRICT, bukan CASCADE: SKU yang punya riwayat stok tidak boleh hilang
  -- diam-diam. Kalau perlu dihentikan, tandai nonaktif — jangan dihapus.
  sku_id      text NOT NULL REFERENCES sku(id) ON DELETE RESTRICT,
  outlet_id   text NOT NULL REFERENCES outlet(id) ON DELETE RESTRICT,
  delta       integer NOT NULL CHECK (delta <> 0),
  reason      text NOT NULL CHECK (reason IN
              ('opening', 'sale', 'return', 'adjustment', 'transfer_in',
               'transfer_out', 'purchase', 'opname')),
  ref_type    text,
  ref_id      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX stock_ledger_lookup_idx ON stock_ledger (tenant_id, sku_id, outlet_id);

CREATE TABLE cash_entry (
  id            bigserial PRIMARY KEY,
  tenant_id     text NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  direction     text NOT NULL CHECK (direction IN ('in', 'out')),
  amount_cents  bigint NOT NULL CHECK (amount_cents > 0),
  reason        text NOT NULL,
  ref_type      text,
  ref_id        text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cash_entry_tenant_created_idx ON cash_entry (tenant_id, created_at DESC);

-- Penegakan append-only di tingkat database. Lapisan aplikasi bisa keliru;
-- ini lapisan yang tidak bisa dilewati tanpa sengaja.
--
-- UPDATE selalu ditolak. DELETE juga ditolak, kecuali pemanggil sengaja
-- menyalakan app.allow_purge — satu-satunya pemakainya adalah reset tenant
-- demo. Jalur itu dibuat eksplisit supaya tidak pernah terjadi tanpa niat.
CREATE OR REPLACE FUNCTION forbid_mutation() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE'
     AND coalesce(current_setting('app.allow_purge', true), 'off') = 'on' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION
    'Tabel % bersifat append-only. Koreksi dilakukan dengan menambah entri lawan, bukan mengubah atau menghapus.',
    TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stock_ledger_append_only
  BEFORE UPDATE OR DELETE ON stock_ledger
  FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

CREATE TRIGGER cash_entry_append_only
  BEFORE UPDATE OR DELETE ON cash_entry
  FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

-- Stok saat ini: hasil hitung, bukan kolom yang disimpan.
CREATE VIEW stock_level AS
  SELECT tenant_id, sku_id, outlet_id, SUM(delta)::integer AS qty
  FROM stock_ledger
  GROUP BY tenant_id, sku_id, outlet_id;

INSERT INTO schema_migration (id) VALUES ('001_init');

COMMIT;
