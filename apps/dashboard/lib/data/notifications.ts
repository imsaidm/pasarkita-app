/**
 * Data notifikasi CONTOH (demo) — Fase 5, PRD §16. §16.3 New-Order Push
 * Notification adalah P0 sungguhan, tapi butuh Notification Service + OMS
 * event nyata yang belum ada — daftar di bawah HANYA untuk mendemonstrasikan
 * tampilan inbox, bukan notifikasi yang benar-benar terkirim.
 */

export type NotificationType = "new_order" | "payment_issue" | "low_stock" | "publish_failed";

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAtLabel: string;
  read: boolean;
}

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  new_order: "Order Baru",
  payment_issue: "Masalah Pembayaran",
  low_stock: "Stok Rendah",
  publish_failed: "Publish Gagal",
};

export const NOTIFICATIONS: AdminNotification[] = [
  { id: "notif-01", type: "new_order", title: "Order baru KRY-20260816-01", body: "Budi Santoso — Rp 264.000", createdAtLabel: "16 Agustus 2026, 09:12", read: false },
  { id: "notif-02", type: "new_order", title: "Order baru KRY-20260816-02", body: "Siti Rahma — Rp 459.000", createdAtLabel: "16 Agustus 2026, 08:47", read: false },
  { id: "notif-03", type: "payment_issue", title: "Pembayaran belum terkonfirmasi", body: "KRY-20260815-11 — Andi Wijaya", createdAtLabel: "15 Agustus 2026, 20:35", read: true },
  { id: "notif-04", type: "low_stock", title: "Stok rendah: Boots Chelsea — Cokelat", body: "Sisa 4 unit (ambang 10)", createdAtLabel: "15 Agustus 2026, 07:00", read: true },
  { id: "notif-05", type: "low_stock", title: "Stok habis: Celana Chino Pria — Khaki", body: "0 unit tersisa", createdAtLabel: "14 Agustus 2026, 07:00", read: true },
];

export async function getNotifications(): Promise<AdminNotification[]> {
  return NOTIFICATIONS;
}
