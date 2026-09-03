"use client";

import { BASELINE_ROLES, ROLE_LABEL, useSession } from "@/lib/auth/session-context";

const SHORT_ROLE_LABEL: Record<(typeof BASELINE_ROLES)[number], string> = {
  Owner: "👑 Owner",
  AdminDashboard: "💻 Admin Toko",
  AdminWarehouse: "📦 Gudang",
};

/**
 * Role Switcher Responsif — Tanpa hydration mismatch.
 */
export function RoleSwitcher() {
  const { role, setRole } = useSession();

  return (
    <label className="inline-flex h-8 items-center gap-1 rounded-full border border-border/80 bg-soft-sand/80 px-2.5 text-xs font-semibold text-deep-pine transition-colors hover:border-karyalo-green sm:gap-1.5 sm:px-3">
      <span className="hidden lg:inline text-muted/70 font-normal">Role:</span>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as (typeof BASELINE_ROLES)[number])}
        className="cursor-pointer bg-transparent text-xs font-bold text-deep-pine focus:outline-none"
        aria-label="Ganti role demo untuk meninjau perilaku permission"
      >
        {BASELINE_ROLES.map((r) => (
          <option key={r} value={r}>
            {SHORT_ROLE_LABEL[r] ?? ROLE_LABEL[r]}
          </option>
        ))}
      </select>
    </label>
  );
}
