"use client";

import { Store, ChevronDown } from "lucide-react";
import { useSession } from "@/lib/auth/session-context";

/**
 * TenantStoreSwitcher — Menampilkan store aktif secara stabil tanpa mismatch hydration.
 */
export function TenantStoreSwitcher() {
  const { storeName } = useSession();

  return (
    <div
      className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink"
      title="Hanya satu store pada prototype ini — switcher multi-store belum relevan"
    >
      <Store size={14} aria-hidden="true" />
      <span className="max-w-[9rem] truncate">{storeName}</span>
      <ChevronDown size={12} className="text-muted" aria-hidden="true" />
    </div>
  );
}
