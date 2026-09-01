/**
 * Placeholder untuk rute yang strukturnya sudah didefinisikan PRD §47
 * Suggested Frontend Page Inventory, tapi kontennya adalah pekerjaan fase
 * berikutnya (Discovery/PDP/Cart/Checkout/Post Purchase — lihat §52).
 *
 * Fase 1 sengaja HANYA membangun app shell + routing, bukan fitur —
 * komponen ini membuat itu eksplisit di setiap halaman (bukan halaman
 * kosong tanpa penjelasan) supaya siapa pun yang klik-klik prototype tahu
 * persis apa yang sudah ada dan apa yang belum.
 */
export function RouteStub({
  title,
  phase,
  description,
}: {
  title: string;
  phase: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex max-w-(--container-content) flex-col items-start gap-3 px-4 py-16 md:px-6">
      <span className="rounded-full bg-soft-sage px-3 py-1 text-xs font-medium text-deep-pine">
        {phase}
      </span>
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      {description && <p className="max-w-prose text-muted">{description}</p>}
      <p className="text-sm text-muted">
        Rute ini sudah terdaftar sesuai struktur PRD (§47) — konten
        sebenarnya belum dibangun pada Fase 1 (Foundation).
      </p>
    </div>
  );
}
