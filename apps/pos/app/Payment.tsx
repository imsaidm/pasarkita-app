'use client';

import { useMemo, useState } from 'react';

export type PaymentMethod = 'cash' | 'qris' | 'card' | 'transfer';

const METHODS: readonly { id: PaymentMethod; label: string }[] = [
  { id: 'cash', label: 'Tunai' },
  { id: 'qris', label: 'QRIS' },
  { id: 'card', label: 'Kartu' },
  { id: 'transfer', label: 'Transfer' },
];

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
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
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [tendered, setTendered] = useState('');

  const tenderedCents = useMemo(() => {
    const digits = tendered.replace(/\D/g, '');
    return digits === '' ? 0 : Number(digits) * 100;
  }, [tendered]);

  const isCash = method === 'cash';
  const enough = !isCash || tenderedCents >= totalCents;
  const changeCents = Math.max(0, tenderedCents - totalCents);

  return (
    <section className="panel" aria-label="Pembayaran">
      <div className="panel-row">
        <span className="label">Total belanja</span>
        <strong className="total">{rupiah.format(totalCents / 100)}</strong>
      </div>

      <div className="methods" role="group" aria-label="Metode pembayaran">
        {METHODS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`btn ${method === item.id ? 'btn-primary' : ''}`}
            onClick={() => setMethod(item.id)}
            aria-pressed={method === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isCash ? (
        <>
          <label>
            Uang diterima
            <input
              inputMode="numeric"
              autoFocus
              value={tendered}
              onChange={(event) => setTendered(event.target.value.replace(/\D/g, ''))}
              placeholder="0"
            />
          </label>

          <div className="quick">
            {quickAmounts(totalCents).map((amount) => (
              <button
                key={amount}
                type="button"
                className="btn"
                onClick={() => setTendered(String(amount))}
              >
                {rupiah.format(amount)}
              </button>
            ))}
          </div>

          <div className="panel-row">
            <span className="label">Kembalian</span>
            <strong className={changeCents > 0 ? 'change' : ''}>
              {rupiah.format(changeCents / 100)}
            </strong>
          </div>

          {!enough && tenderedCents > 0 ? (
            <p className="notice" role="alert">
              Uang yang diterima kurang {rupiah.format((totalCents - tenderedCents) / 100)}.
            </p>
          ) : null}
        </>
      ) : (
        <p className="muted small">
          Pastikan pembayaran sudah diterima sebelum menyelesaikan transaksi.
        </p>
      )}

      <div className="actions">
        <button type="button" className="btn" onClick={onCancel} disabled={busy}>
          Batal
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy || !enough}
          onClick={() => onConfirm(method, isCash ? tenderedCents : null)}
        >
          {busy ? 'Menyimpan…' : 'Selesaikan'}
        </button>
      </div>
    </section>
  );
}
