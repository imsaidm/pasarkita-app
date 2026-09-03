/**
 * Data tim & audit log CONTOH (demo) — Skala UMKM.
 * 3 Role Inti: Owner, Admin Dashboard, Admin Warehouse.
 */

import { BaselineRole } from "@/lib/auth/session-context";

export interface TeamMember {
  id: string;
  name: string;
  maskedEmail: string;
  role: BaselineRole;
  status: "active" | "invited";
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "tm-01", name: "Budi Santoso", maskedEmail: "b***i@karyalo.example", role: "Owner", status: "active" },
  { id: "tm-02", name: "Ayu Kartika", maskedEmail: "a***a@karyalo.example", role: "AdminDashboard", status: "active" },
  { id: "tm-03", name: "Doni Saputra", maskedEmail: "d***a@karyalo.example", role: "AdminWarehouse", status: "active" },
];

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  resource: string;
  result: "success" | "failed";
  timestampLabel: string;
}

export const AUDIT_LOG: AuditEntry[] = [
  { id: "aud-01", actor: "Budi Santoso (Owner)", action: "Menyetujui integrasi Shopee API", resource: "Shopee OpenAPI v2", result: "success", timestampLabel: "31 Agustus 2026, 17:30" },
  { id: "aud-02", actor: "Ayu Kartika (Admin Dashboard)", action: "Membuat voucher promo gajian", resource: "GAJIAN50", result: "success", timestampLabel: "31 Agustus 2026, 15:10" },
  { id: "aud-03", actor: "Doni Saputra (Admin Warehouse)", action: "Update resi Shopee Xpress", resource: "KRY-20260816-01", result: "success", timestampLabel: "31 Agustus 2026, 14:05" },
  { id: "aud-04", actor: "Ayu Kartika (Admin Dashboard)", action: "Update banner homepage", resource: "Banner Promo September", result: "success", timestampLabel: "30 Agustus 2026, 11:40" },
  { id: "aud-05", actor: "Budi Santoso (Owner)", action: "Mengundang staf gudang", resource: "doni@karyalo.example", result: "success", timestampLabel: "28 Agustus 2026, 08:00" },
];

export async function getTeamMembers(): Promise<TeamMember[]> {
  return TEAM_MEMBERS;
}

export async function getAuditLog(): Promise<AuditEntry[]> {
  return AUDIT_LOG;
}
