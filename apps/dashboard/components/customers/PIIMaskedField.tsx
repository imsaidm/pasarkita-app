"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PermissionGate } from "@/components/system/PermissionGate";

/**
 * PRD §17, §39 `PIIMaskedField`. Nilai yang diterima SUDAH masked dari
 * sumber data (`lib/data/customers.ts`) — komponen ini mensimulasikan
 * pola toggle-reveal berbasis permission `customerPii`, tapi tidak
 * pernah benar-benar mengungkap PII asli karena memang tidak ada (§17,
 * catatan privasi di data source).
 */
export function PIIMaskedField({ label, value }: { label: string; value: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <PermissionGate
      capability="customerPii"
      showDenied
      fallback={
        <div className="text-sm">
          <span className="text-muted">{label}: </span>
          <span className="text-ink">•••• (permission diperlukan)</span>
        </div>
      }
    >
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted">{label}:</span>
        <span className="text-ink">{revealed ? value : "•".repeat(Math.min(value.length, 10))}</span>
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          aria-label={revealed ? `Sembunyikan ${label}` : `Tampilkan ${label}`}
          className="text-muted hover:text-ink"
        >
          {revealed ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
        </button>
      </div>
    </PermissionGate>
  );
}
