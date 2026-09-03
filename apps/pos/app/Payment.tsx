"use client";

import { useMemo, useState } from "react";
import { Banknote, QrCode, CreditCard, ArrowLeftRight } from "lucide-react";

export type PaymentMethod = "cash" | "qris" | "card" | "transfer";

const METHODS: readonly { id: PaymentMethod; label: string; Icon: typeof Banknote }[] = [
  { id: "cash", label: "Tunai", Icon: Banknote },
  { id: "qris", label: "QRIS", Icon: QrCode },
  { id: "card", label: "Kartu", Icon: CreditCard },
  { id: "transfer", label: "Transfer", Icon: ArrowLeftRight },
];

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Pecahan yang biasa diserahkan pembeli, supaya kasir tidak perlu mengetik. */
function quickAmounts(totalCents: number): number[] {
  const total = totalCents / 100;
  const rounded = [
    Math.ceil(total / 5_000) * 5_000,
    Math.ceil(total / 10_000) * 10_000,
    Math.ceil(total / 50_000) * 50_000,
    Math.ceil(total / 100_000) * 100_000,
  ];
  return [...new Set(rounded)].filter((amount) => amount >= total).slice(0, 4);
}

type Props = {
  totalCents: number;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (method: PaymentMethod, tenderedCents: number | null) => void;
};

export default function Payment({ totalCents, busy, onCancel, onConfirm }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [tendered, setTendered] = useState("");

  const tenderedCents = useMemo(() => {
    const digits = tendered.replace(/\D/g, "");
    return digits === "" ? 0 : Number(digits) * 100;
  }, [tendered]);

  const isCash = method === "cash";
  const enough = !isCash || tenderedCents >= totalCents;
  const changeCents = Math.max(0, tenderedCents - totalCents);
  const kurang = Math.max(0, totalCents - tenderedCents);

  return (
    <section
      aria-label="Pembayaran"
      className="mx-auto flex max-w-lg flex-col gap-4 rounded-(--radius-card) border border-border bg-white p-4 sm:p-5"
    >
      <div className="rounded-xl bg-deep-pine px-4 py-3.5 text-warm-white">
        <p className="text-[11px] font-medium uppercase tracking-wider text-soft-sage">
          Total belanja
        </p>
        <p className="tabular mt-0.5 text-3xl font-bold tracking-tight">
          {rupiah.format(totalCents / 100)}
        </p>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Metode pembayaran
        </p>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Metode pembayaran">
          {METHODS.map(({ id, label, Icon }) => {
            const active = method === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setMethod(id)}
                aria-pressed={active}
                className={`tap-target-pos flex items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors ${
                  active
                    ? "border-karyalo-green bg-karyalo-green text-warm-white"
                    : "border-border bg-white text-ink hover:border-karyalo-green"
                }`}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {isCash ? (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Uang diterima
            </span>
            <input
              inputMode="numeric"
              autoFocus
              value={tendered}
              onChange={(event) => setTendered(event.target.value.replace(/\D/g, ""))}
              placeholder="0"
              className="tabular tap-target-pos rounded-xl border border-border px-3.5 text-2xl font-bold text-ink outline-none focus:border-karyalo-green"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            {quickAmounts(totalCents).map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setTendered(String(amount))}
                className="tabular tap-target rounded-xl border border-border bg-soft-sand px-3 py-2 text-sm font-semibold text-ink hover:border-karyalo-green"
              >
                {rupiah.format(amount)}
              </button>
            ))}
          </div>

          <div
            className={`flex items-baseline justify-between rounded-xl px-4 py-3 ${
              changeCents > 0 ? "bg-success-soft" : "bg-soft-sand"
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Kembalian
            </span>
            <strong
              className={`tabular text-2xl font-bold tracking-tight ${
                changeCents > 0 ? "text-success" : "text-ink"
              }`}
            >
              {rupiah.format(changeCents / 100)}
            </strong>
          </div>

          {kurang > 0 && tenderedCents > 0 ? (
            <p
              role="alert"
              className="rounded-xl border border-status-critical/30 bg-status-critical/5 px-3.5 py-2.5 text-xs font-medium text-status-critical"
            >
              Uang yang diterima kurang {rupiah.format(kurang / 100)}.
            </p>
          ) : null}
        </>
      ) : (
        <p className="rounded-xl bg-soft-sand px-3.5 py-3 text-xs leading-relaxed text-muted">
          Pastikan pembayaran benar-benar sudah diterima sebelum menyelesaikan transaksi. Kasir
          tidak bisa memeriksanya untuk Anda.
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="tap-target-pos flex-1 rounded-full border border-border text-sm font-semibold text-muted hover:border-ink hover:text-ink disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => onConfirm(method, isCash ? tenderedCents : null)}
          disabled={busy || !enough}
          className="tap-target-pos flex-[2] rounded-full bg-karyalo-green text-sm font-semibold text-warm-white hover:opacity-90 disabled:opacity-40"
        >
          {busy ? "Menyimpan…" : "Selesaikan"}
        </button>
      </div>
    </section>
  );
}
