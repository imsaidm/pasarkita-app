import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-muted"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1 transition-colors hover:text-deep-pine focus-visible:rounded focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-karyalo-green"
      >
        <Home size={13} className="shrink-0 opacity-75" aria-hidden="true" />
        <span className="font-medium">Beranda</span>
      </Link>

      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight size={12} className="shrink-0 text-muted/60" aria-hidden="true" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="font-medium transition-colors hover:text-deep-pine focus-visible:rounded focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-karyalo-green"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? "page" : undefined}
                className="font-semibold text-ink max-w-[220px] truncate sm:max-w-none"
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
