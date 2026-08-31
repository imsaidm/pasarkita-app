# Pasarkita — App

Store, Pos, dan Dashboard di atas satu skema database, satu auth, dan satu
definisi paket.

| Aplikasi | Alamat | Untuk siapa |
| --- | --- | --- |
| `apps/store` | store.pasarkita.net | pembeli |
| `apps/pos` | pos.pasarkita.net | kasir |
| `apps/dashboard` | dashboard.pasarkita.net | pemilik, admin, gudang, keuangan |

Company profile berada di repository terpisah, `pasarkita-web`, karena tidak
menyentuh database dan jadwal rilisnya berbeda.

## Kenapa satu repository

Ketiga aplikasi memakai model produk, stok, dan pesanan yang sama. Kalau
dipisah, tipe yang identik disalin tiga kali dan setiap perubahan skema
menjadi rilis terkoordinasi di tiga tempat. Satu repository tetap
menghasilkan tiga proses dan tiga subdomain yang terpisah.

## Paket

Matriks paket hidup sebagai kode di `packages/plan`, bukan sebagai catatan di
dokumen. Tiga channel dikali tiga tier:

|  | Toko Offline | Toko Online | Omnichannel |
| --- | --- | --- | --- |
| **Startup** | 10 SKU | 10 SKU | 10 SKU |
| **Middle** | 100 SKU | 100 SKU | 100 SKU |
| **Pro** | 1.000 SKU | 1.000 SKU | 1.000 SKU |

Satu tenant punya satu paket. Ketiga aplikasi membaca paket yang sama, jadi
menaikkan tier cukup mengubah satu baris dan semuanya ikut.

```ts
import { parsePlan, can, appsOf } from '@pasarkita/plan';

const plan = parsePlan('offline', 'startup');
appsOf(plan);              // ['pos', 'dashboard'] — store tertutup
can(plan, 'variants');     // false — terbuka mulai Middle
can(plan, 'customDomain'); // false — hanya ada di channel Online
```

### Yang tidak pernah dikunci

Mode offline, ekspor data, cadangan otomatis, keamanan akun, retur sederhana,
dan pencatatan tunai/QRIS tersedia di semua paket termasuk yang gratis.
Daftarnya ada di `ALWAYS_ON` pada `packages/plan/src/features.ts`. Ini bukan
daftar fitur, tapi daftar janji — memindahkan salah satunya ke tabel gating
merusak kepercayaan pada produk, bukan menaikkan pendapatan.

## Mode demo

Store dan Pos punya tombol masuk demo tanpa mengisi apa pun. Yang dibuka
adalah tenant demo terpisah berisi data palsu, bukan data toko sungguhan.

Empat aturan yang menjaganya, ada di `packages/auth/src/demo.ts`:

1. Sesi demo hanya boleh menunjuk tenant ber-prefix `demo_`.
2. Sesi demo tidak membawa `userId` — tidak ada manusia di baliknya.
3. Sesi demo berumur 45 menit.
4. Aksi yang keluar dari kotak pasir selalu ditolak: kirim pesan, pembayaran
   sungguhan, ekspor data, ubah pengaturan akun, undang pengguna.

Melonggarkan salah satunya berarti membuka data pelanggan ke siapa pun yang
tahu alamatnya.

## Struktur

```
packages/plan    definisi paket dan gating fitur — tanpa dependensi
packages/auth    sesi bertanda tangan, sesi demo, pemeriksaan izin
packages/db      skema dan migrasi
apps/store       toko online
apps/pos         kasir
apps/dashboard   kelola toko
```

## Menjalankan

```bash
npm install
cp .env.example .env      # lalu isi SESSION_SECRET dan DATABASE_URL
npm run db:migrate
npm test
```

Node 22 ke atas.

## Perintah

| Perintah | Kegunaan |
| --- | --- |
| `npm test` | Menjalankan test seluruh workspace |
| `npm run typecheck` | Memeriksa tipe seluruh workspace |
| `npm run build` | Build seluruh aplikasi |
| `npm run db:migrate` | Menjalankan migrasi |
| `npm run db:seed-demo` | Mengisi ulang tenant demo dengan data palsu |

## Deployment

VPS yang sama menjalankan ArenaDewata. Prosedur rilis, port, dan batasan yang
melindunginya ada di `docs/deploy.md`. Baca sebelum menyentuh server.
