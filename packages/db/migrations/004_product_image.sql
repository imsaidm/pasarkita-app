-- Pasarkita — foto produk
--
-- Tabel tersendiri, bukan kolom `image_url` di product: sebuah produk hampir
-- selalu punya lebih dari satu foto, dan urutannya berarti — yang pertama
-- dipakai di kartu katalog dan hasil pencarian.

BEGIN;

CREATE TABLE product_image (
  id          bigserial PRIMARY KEY,
  tenant_id   text NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  product_id  text NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  -- Alamat berkas. Untuk sekarang jalur di dalam aplikasi (/images/...);
  -- begitu ada penyimpanan objek, kolom yang sama menampung URL penuh.
  url         text NOT NULL,
  sort        integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX product_image_lookup_idx ON product_image (tenant_id, product_id, sort);

-- Deskripsi ikut di sini karena halaman produk tidak berguna tanpanya:
-- pembeli tidak bisa memutuskan membeli dari nama dan harga saja.
ALTER TABLE product ADD COLUMN short_description text NOT NULL DEFAULT '';
ALTER TABLE product ADD COLUMN description       text NOT NULL DEFAULT '';

INSERT INTO schema_migration (id) VALUES ('004_product_image');

COMMIT;
