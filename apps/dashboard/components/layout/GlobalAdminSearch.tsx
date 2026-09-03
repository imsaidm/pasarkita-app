"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/**
 * PRD §8.4 Global Controls — "Global search untuk order number, product
 * name/SKU, dan customer identity yang diizinkan"; §39 `GlobalAdminSearch`.
 * Fase 1: input funsional secara navigasi (submit ke /search?q=...), TAPI
 * halaman hasilnya sendiri masih RouteStub — belum ada index order/
 * produk/customer sungguhan untuk dicari (itu Fase 3/4/5).
 */
export function GlobalAdminSearch() {
  const [value, setValue] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="hidden max-w-sm flex-1 md:flex">
      <label className="relative w-full">
        <span className="sr-only">Cari order, produk, atau pelanggan</span>
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Cari order, produk, atau pelanggan…"
          className="w-full rounded-full border border-border bg-soft-sand py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:bg-warm-white"
        />
      </label>
    </form>
  );
}
