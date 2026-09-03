"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Session & Role Management — UMKM & Shopee Partner Audit
 * 3 Role Inti UMKM:
 * 1. Owner: Pemilik bisnis dengan akses mutlak (Keuangan, Tim, Pengaturan, Integrasi Marketplace).
 * 2. Admin Dashboard: Pengelola harian toko (Order, Produk/Katalog, CMS Storefront, Promosi, Pelanggan).
 * 3. Admin Warehouse: Staf gudang & fulfillment (Pemrosesan packing pesanan, cetak resi, update stok fisik).
 */

export const BASELINE_ROLES = [
  "Owner",
  "AdminDashboard",
  "AdminWarehouse",
] as const;

export type BaselineRole = (typeof BASELINE_ROLES)[number];

export const ROLE_LABEL: Record<BaselineRole, string> = {
  Owner: "Owner / Pemilik Toko",
  AdminDashboard: "Admin Dashboard / Toko",
  AdminWarehouse: "Admin Warehouse / Gudang",
};

/** Kategori capability permission matrix untuk UMKM */
export interface CapabilitySet {
  dashboardRead: boolean;
  cmsWrite: boolean;
  catalogWrite: boolean;
  promotionWrite: boolean;
  orderRead: boolean;
  orderProcess: boolean;
  cancelRefundRequest: boolean;
  customerPii: boolean;
  teamRoleManage: boolean;
  analyticsExport: boolean;
}

export const CAPABILITY_MATRIX: Record<BaselineRole, CapabilitySet> = {
  Owner: {
    dashboardRead: true,
    cmsWrite: true,
    catalogWrite: true,
    promotionWrite: true,
    orderRead: true,
    orderProcess: true,
    cancelRefundRequest: true,
    customerPii: true,
    teamRoleManage: true,
    analyticsExport: true,
  },
  AdminDashboard: {
    dashboardRead: true,
    cmsWrite: true,
    catalogWrite: true,
    promotionWrite: true,
    orderRead: true,
    orderProcess: true,
    cancelRefundRequest: true,
    customerPii: true,
    teamRoleManage: false,
    analyticsExport: true,
  },
  AdminWarehouse: {
    dashboardRead: true,
    cmsWrite: false,
    catalogWrite: true,
    promotionWrite: false,
    orderRead: true,
    orderProcess: true,
    cancelRefundRequest: false,
    customerPii: false,
    teamRoleManage: false,
    analyticsExport: false,
  },
};

interface SessionState {
  role: BaselineRole;
  userName: string;
  userEmail: string;
  storeName: string;
  isAuthenticated: boolean;
  hydrated: boolean;
}

interface SessionContextValue extends SessionState {
  capabilities: CapabilitySet;
  setRole: (role: BaselineRole) => void;
  login: (role?: BaselineRole, email?: string) => void;
  logout: () => void;
}

const STORAGE_SESSION_KEY = "karyalo-manage.session.v3";
const STORAGE_AUTH_KEY = "karyalo-manage.auth.v3";

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<BaselineRole>("Owner");
  const [userEmail, setUserEmail] = useState("shopee.reviewer@karyalo.com");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const isAuth = window.localStorage.getItem(STORAGE_AUTH_KEY);
      if (isAuth === "true") {
        setIsAuthenticated(true);
      }

      const raw = window.localStorage.getItem(STORAGE_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { role?: BaselineRole; email?: string };
        if (parsed.role && BASELINE_ROLES.includes(parsed.role)) {
          setRoleState(parsed.role);
        }
        if (parsed.email) {
          setUserEmail(parsed.email);
        }
      }
    } catch {
      // localStorage tidak tersedia (private mode)
    }
    setHydrated(true);
  }, []);

  const setRole = useCallback((next: BaselineRole) => {
    setRoleState(next);
    try {
      window.localStorage.setItem(
        STORAGE_SESSION_KEY,
        JSON.stringify({ role: next, email: userEmail })
      );
    } catch {
      // no-op
    }
  }, [userEmail]);

  const login = useCallback((nextRole: BaselineRole = "Owner", email: string = "shopee.reviewer@karyalo.com") => {
    setRoleState(nextRole);
    setUserEmail(email);
    setIsAuthenticated(true);
    try {
      document.cookie = "karyalo_auth=true; path=/; max-age=604800; SameSite=Lax";
      window.localStorage.setItem(STORAGE_AUTH_KEY, "true");
      window.localStorage.setItem(
        STORAGE_SESSION_KEY,
        JSON.stringify({ role: nextRole, email })
      );
    } catch {
      // no-op
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      document.cookie = "karyalo_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.localStorage.removeItem(STORAGE_AUTH_KEY);
    } catch {
      // no-op
    }
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      role,
      userName: role === "Owner" ? "Budi Santoso (Owner)" : role === "AdminDashboard" ? "Siti Admin" : "Joko Gudang",
      userEmail,
      storeName: "Karyalo Store (Demo)",
      isAuthenticated,
      hydrated,
      capabilities: CAPABILITY_MATRIX[role],
      setRole,
      login,
      logout,
    }),
    [role, userEmail, isAuthenticated, hydrated, setRole, login, logout]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession harus dipakai di dalam SessionProvider");
  return ctx;
}
