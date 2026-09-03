/**
 * Status pesanan dan labelnya.
 *
 * Sengaja terpisah dari `orders.ts` yang bertanda `server-only`: badge status
 * dipakai komponen klien, dan label ini nilai runtime — bukan tipe yang hilang
 * saat kompilasi. Kalau keduanya satu berkas, komponen klien akan menarik
 * lapisan basis data ke dalam bundelnya.
 */

export type OrderStatus = 'diproses' | 'dikirim' | 'selesai' | 'dibatalkan';

export const ORDER_STATUS_LABEL: Readonly<Record<OrderStatus, string>> = Object.freeze({
  diproses: 'Diproses',
  dikirim: 'Dikirim',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
});
