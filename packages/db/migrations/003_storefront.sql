-- Pasarkita — kebutuhan storefront dan panel kelola
--
-- Hanya kolom yang tanpa keberadaannya sebuah halaman tidak bisa berfungsi
-- sama sekali. Yang sekadar memperkaya tampilan ditunda sampai ada sumber
-- datanya yang jujur.

BEGIN;

-- ---------------------------------------------------------------- slug

-- Setiap rute storefront dialamati lewat slug. Tanpa kolom ini, halaman
-- produk harus memindai seluruh katalog di sisi aplikasi, dan langsung pecah
-- begitu ada dua produk bernama sama.
ALTER TABLE product ADD COLUMN slug text;

-- Backfill dengan pembeda urutan kalau namanya bertabrakan. Tanpa ini,
-- indeks unik di bawah akan gagal di tengah migrasi pada katalog nyata.
UPDATE product p
SET slug = base.s || CASE WHEN base.rn = 1 THEN '' ELSE '-' || base.rn END
FROM (
  SELECT id,
         lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g')) AS s,
         row_number() OVER (
           PARTITION BY tenant_id,
                        lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'))
           ORDER BY created_at, id
         ) AS rn
  FROM product
) base
WHERE p.id = base.id;

ALTER TABLE product ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX product_slug_idx ON product (tenant_id, slug);

-- ---------------------------------------------------------------- pengiriman

-- Tahap pengiriman dipisah dari status pembayaran, bukan digabung.
--
-- `status` tetap berarti uang: 'paid' artinya uang sudah masuk, dan itulah
-- yang dijamin oleh cash_entry. Perjalanan barang punya sumbunya sendiri.
-- Melebarkan CHECK pada `status` dengan 'dikirim'/'selesai' akan mengubah
-- arti setiap laporan kas yang membaca kolom itu.
ALTER TABLE "order" ADD COLUMN fulfillment text NOT NULL DEFAULT 'none'
  CHECK (fulfillment IN ('none', 'packing', 'shipped', 'delivered'));

CREATE INDEX order_fulfillment_idx ON "order" (tenant_id, fulfillment)
  WHERE fulfillment <> 'none';

-- ---------------------------------------------------------------- alamat

-- Checkout sudah meminta data ini ke pembeli. Tanpa kolomnya, aplikasi
-- membuang apa yang baru saja diketik orang — itu lebih buruk daripada
-- tidak punya halaman checkout sama sekali.
ALTER TABLE "order" ADD COLUMN recipient_name  text;
ALTER TABLE "order" ADD COLUMN recipient_phone text;
ALTER TABLE "order" ADD COLUMN address         text;
ALTER TABLE "order" ADD COLUMN shipping_label  text;
ALTER TABLE "order" ADD COLUMN shipping_cents  bigint NOT NULL DEFAULT 0
  CHECK (shipping_cents >= 0);

-- ---------------------------------------------------------------- stok menipis

-- Ambang per SKU, bukan satu angka untuk semua toko. Beras dan jam tangan
-- tidak mungkin memakai ambang yang sama.
ALTER TABLE sku ADD COLUMN low_stock_threshold integer NOT NULL DEFAULT 5
  CHECK (low_stock_threshold >= 0);

INSERT INTO schema_migration (id) VALUES ('003_storefront');

COMMIT;
