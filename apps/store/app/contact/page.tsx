import { Mail, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-(--container-content) px-4 py-8 md:px-6">
      <h1 className="mb-6 text-2xl font-semibold text-ink">Hubungi Kami</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-(--radius-card) border border-border p-5">
          <MessageCircle size={22} className="mt-0.5 shrink-0 text-deep-pine" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-ink">WhatsApp</p>
            <p className="text-sm text-muted">
              Nomor kontak menyusul — belum ditentukan pemilik toko.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-(--radius-card) border border-border p-5">
          <Mail size={22} className="mt-0.5 shrink-0 text-deep-pine" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-ink">Email</p>
            <p className="text-sm text-muted">
              Alamat email menyusul — belum ditentukan pemilik toko.
            </p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted">
        Kontak resmi Karyalo Store belum ditetapkan pada prototype ini —
        lihat <code className="rounded bg-soft-sand px-1 py-0.5">tenant.contact</code> di
        `lib/config/tenant.ts`.
      </p>
    </div>
  );
}
