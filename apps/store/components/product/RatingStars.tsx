import { Star } from "lucide-react";

/**
 * Tampilan rating bintang + jumlah ulasan (social proof ringan pada
 * ProductCard/PDP). BUKAN fitur "Reviews" penuh (§26 — tulis ulasan, daftar
 * ulasan, dst.) yang masih di-nonaktifkan lewat `featureFlags.reviews` di
 * `lib/config/tenant.ts`; ini murni angka ringkasan yang sudah ada di data
 * produk mock.
 */
export function RatingStars({
  rating,
  reviewCount,
  size = 14,
}: {
  rating: number;
  reviewCount?: number;
  size?: number;
}) {
  // Belum ada ulasan berarti belum ada yang bisa ditampilkan. Bintang 0,0
  // bukan "netral" — pembeli membacanya sebagai penilaian buruk.
  if (rating <= 0 || reviewCount === 0) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-muted">
      <Star size={size} strokeWidth={0} fill="#A5482D" aria-hidden="true" />
      <span className="font-medium text-ink">{rating.toFixed(1)}</span>
      {typeof reviewCount === "number" && <span>({reviewCount})</span>}
    </div>
  );
}
