"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

/**
 * PRD §16 Notifications, §39 `NotificationBell`. Fase 1 — TIDAK ada
 * notification service sungguhan, jadi badge SELALU kosong (bukan angka
 * contoh) — §37 Coding Rule 21 melarang fake notification data. Klik
 * mengarah ke /notifications (RouteStub, Fase 5).
 */
export function NotificationBell() {
  return (
    <Link
      href="/notifications"
      aria-label="Notifikasi"
      className="tap-target relative flex items-center justify-center rounded-full text-ink hover:bg-soft-sand"
    >
      <Bell size={20} aria-hidden="true" />
    </Link>
  );
}
