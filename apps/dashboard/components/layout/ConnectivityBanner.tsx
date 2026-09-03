"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/**
 * PRD §9.1 Shell Responsibilities — "connectivity banner"; §27.4 Offline
 * Write — "Write kritis yang dilakukan offline tidak boleh ditampilkan
 * sebagai berhasil" (Principle #7 "No silent critical sync"). Banner ini
 * murni indikator, tidak memblokir navigasi/baca (§27.3 Offline Read).
 */
export function ConnectivityBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-status-warning px-4 py-1.5 text-xs font-medium text-warm-white">
      <WifiOff size={13} aria-hidden="true" />
      Offline — sebagian data mungkin tidak terbaru. Perubahan penting tidak
      akan tersimpan sampai koneksi kembali.
    </div>
  );
}
