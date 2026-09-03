"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

/**
 * SEARCH-01 Search Entry — search harus terlihat sangat awal (§14, HOME-02).
 * Fase 1: navigasi ke /search?q=... (halaman /search sendiri masih stub,
 * lihat app/search/page.tsx — hasil pencarian sungguhan adalah Fase 2).
 *
 * Ikon: lucide-react (16 Agustus 2026), disamakan dengan admin_dashboard.
 */
export function SearchEntry({ variant = "bar" }: { variant?: "bar" | "icon" }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  if (variant === "icon") {
    return (
      <a
        href="/search"
        aria-label="Cari produk"
        className="tap-target inline-flex items-center justify-center rounded-full text-ink hover:bg-soft-sage"
      >
        <Search size={18} strokeWidth={2} aria-hidden="true" />
      </a>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex w-full items-center gap-2 rounded-full border border-border bg-warm-white px-4 py-2.5"
    >
      <Search size={18} strokeWidth={2} className="shrink-0 text-muted" aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari produk, koleksi terbaru..."
        aria-label="Cari produk"
        className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
      />
    </form>
  );
}
