import { BellOff } from "lucide-react";

/**
 * Notifikasi push belum tersedia.
 *
 * Versi sebelumnya menyimpan langganan perangkat lewat Convex. Di skema
 * sekarang belum ada tabel untuk menyimpannya, dan belum ada kunci VAPID.
 *
 * Tombol yang kelihatan bisa ditekan tapi tidak menyimpan apa pun lebih buruk
 * daripada tidak ada tombol: pemilik toko akan menunggu notifikasi pesanan
 * yang tidak akan pernah datang, dan itu berarti pesanan telat diproses.
 * Jadi keadaannya dinyatakan apa adanya.
 */
export function PushSubscribeButton() {
  return (
    <div className="flex items-start gap-3 rounded-(--radius-card) border border-border bg-soft-sand px-4 py-3.5">
      <BellOff size={18} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-deep-pine">
          Notifikasi ke perangkat belum tersedia
        </p>
        <p className="mt-0.5 text-xs text-muted">
          Sementara ini pesanan baru dipantau dari halaman{" "}
          <span className="font-medium text-ink">Pesanan</span>. Notifikasi push akan
          dinyalakan setelah penyimpanan langganan perangkat tersedia.
        </p>
      </div>
    </div>
  );
}
