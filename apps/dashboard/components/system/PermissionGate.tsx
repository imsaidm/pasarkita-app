"use client";

import { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { useSession, CapabilitySet } from "@/lib/auth/session-context";

/**
 * PermissionGate — Mengontrol akses fitur berdasarkan capability role aktif
 */
export function PermissionGate({
  capability,
  fallback = null,
  showDenied = false,
  deniedMessage,
  children,
}: {
  capability: keyof CapabilitySet;
  fallback?: ReactNode;
  showDenied?: boolean;
  deniedMessage?: string;
  children: ReactNode;
}) {
  const { capabilities, role } = useSession();

  // Aman di SSR dan Client tanpa menghasilkan hydration mismatch
  if (capabilities && capabilities[capability]) {
    return <>{children}</>;
  }

  if (showDenied) {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl border border-status-warning/40 bg-status-warning/10 px-4 py-3 text-xs text-status-warning">
        <ShieldAlert size={16} className="shrink-0 text-status-warning" aria-hidden="true" />
        <span className="font-medium">
          {deniedMessage || `Role aktif (${role}) memiliki batasan akses untuk tindakan ini.`}
        </span>
      </div>
    );
  }
  return <>{fallback}</>;
}
