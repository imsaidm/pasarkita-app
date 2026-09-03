import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function SectionHeading({
  title,
  href,
  hrefLabel = "Lihat semua",
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-ink md:text-xl">{title}</h2>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-0.5 text-sm font-medium text-deep-pine hover:underline"
        >
          {hrefLabel}
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
