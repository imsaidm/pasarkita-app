"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { PermissionGate } from "@/components/system/PermissionGate";

/**
 * PRD §14.3 Order Detail command bar, §14.4 Mutation Safety. §37 Coding
 * Rule 9: mutation kritis wajib idempotency key + state pending/success/
 * error eksplisit — belum ada backend untuk itu di Fase 1. Tombol di
 * bawah SENGAJA tidak pernah menampilkan "berhasil" (itu akan jadi klaim
 * palsu) — hanya menjelaskan bahwa aksi ini simulasi.
 */
export function OrderCommandBar() {
  const [note, setNote] = useState<string | null>(null);

  function simulate(label: string) {
    setNote(`"${label}" belum tersambung ke OMS — tidak ada perubahan yang benar-benar tersimpan (Fase 4, §14.4 Mutation Safety).`);
  }

  return (
    <div className="flex flex-col gap-2 rounded-(--radius-card) border border-border bg-warm-white p-4">
      <div className="flex flex-wrap gap-2">
        <PermissionGate capability="orderProcess">
          <button
            onClick={() => simulate("Proses Order")}
            className="tap-target rounded-full bg-karyalo-green px-4 py-2 text-xs font-medium text-warm-white hover:opacity-90"
          >
            Proses Order
          </button>
        </PermissionGate>
        <PermissionGate capability="orderProcess">
          <button
            onClick={() => simulate("Tandai Dikirim")}
            className="tap-target rounded-full border border-border px-4 py-2 text-xs font-medium text-ink hover:bg-soft-sand"
          >
            Tandai Dikirim
          </button>
        </PermissionGate>
        <PermissionGate capability="cancelRefundRequest">
          <button
            onClick={() => simulate("Batalkan Order")}
            className="tap-target rounded-full border border-border px-4 py-2 text-xs font-medium text-status-critical hover:bg-terracotta-soft"
          >
            Batalkan Order
          </button>
        </PermissionGate>
        <PermissionGate capability="cancelRefundRequest">
          <button
            onClick={() => simulate("Ajukan Refund")}
            className="tap-target rounded-full border border-border px-4 py-2 text-xs font-medium text-ink hover:bg-soft-sand"
          >
            Ajukan Refund
          </button>
        </PermissionGate>
      </div>
      {note && (
        <div className="flex items-start gap-2 rounded-lg bg-soft-sand px-3 py-2 text-xs text-muted">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          {note}
        </div>
      )}
    </div>
  );
}
