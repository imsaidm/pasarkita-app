import Link from "next/link";
import { getNotifications, NOTIFICATION_TYPE_LABEL } from "@/lib/data/notifications";
import { SampleDataBanner } from "@/components/system/SampleDataBanner";
import { Circle } from "lucide-react";

/**
 * PRD §16.2 Notification Center — inbox in-app.
 *
 * **Diperbarui 16 Agustus 2026:** push notification order baru (§16.3)
 * SUDAH nyata sekarang — lihat `/settings/notifications` untuk
 * mengaktifkan. Daftar di bawah ini TETAP data contoh (inbox in-app
 * durable yang mencatat SEMUA push, bukan cuma yang lagi online, adalah
 * pekerjaan terpisah yang belum dibangun — push yang sudah ada sekarang
 * hanya notifikasi OS langsung, belum tersimpan sebagai baris di sini).
 */
// Seluruh panel kelola berada di balik login dan menampilkan data milik satu
// toko. Tidak ada yang boleh di-prerender saat build.
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-6 md:px-6 md:py-8">
      <h1 className="mb-4 text-xl font-semibold text-ink md:text-2xl">Notifikasi</h1>
      <p className="mb-4 text-xs text-muted">
        Push notification order baru sudah aktif — atur di{" "}
        <Link href="/settings/notifications" className="text-karyalo-green underline">
          Pengaturan Notifikasi
        </Link>
        . Daftar riwayat di bawah ini masih contoh (inbox in-app durable belum dibangun).
      </p>
      <SampleDataBanner note="Inbox in-app (riwayat semua notifikasi, dibaca/belum) belum tersambung backend — beda dari push order baru yang sudah aktif." />
      <div className="flex flex-col divide-y divide-border rounded-(--radius-card) border border-border bg-warm-white">
        {notifications.map((n) => (
          <div key={n.id} className="flex items-start gap-3 px-4 py-3.5">
            {!n.read && <Circle size={8} className="mt-1.5 shrink-0 fill-karyalo-green text-karyalo-green" aria-hidden="true" />}
            <div className={n.read ? "ml-[20px]" : ""}>
              <p className="text-xs font-medium text-muted">{NOTIFICATION_TYPE_LABEL[n.type]}</p>
              <p className="text-sm font-medium text-ink">{n.title}</p>
              <p className="text-xs text-muted">{n.body}</p>
              <p className="mt-0.5 text-xs text-muted">{n.createdAtLabel}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
