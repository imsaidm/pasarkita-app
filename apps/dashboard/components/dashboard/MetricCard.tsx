import { LucideIcon, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export interface MetricCardProps {
  label: string;
  value?: string | number | null;
  hint?: string;
  icon?: LucideIcon;
  href?: string;
  statusBadge?: string;
  variant?: "primary" | "standard" | "compact" | "warning";
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

/**
 * MetricCard — Impeccably Polished & Distilled.
 * Desain kartu metrik elegan, lega, dan bebas kepadatan visual.
 */
export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  statusBadge,
  variant = "standard",
  isLoading = false,
  isError = false,
  errorMessage = "Gagal memuat",
}: MetricCardProps) {
  const isAvailable = !isLoading && !isError && value !== undefined && value !== null;

  // Format nilai jika berupa number
  const formattedValue =
    typeof value === "number"
      ? new Intl.NumberFormat("id-ID").format(value)
      : value ?? "—";

  const Content = (
    <div
      className={`group relative flex min-w-0 flex-col justify-between rounded-2xl border transition-all duration-150 motion-reduce:transition-none ${
        href
          ? "cursor-pointer hover:border-karyalo-green/40 hover:shadow-xs focus-within:ring-2 focus-within:ring-karyalo-green focus-within:ring-offset-2 active:scale-[0.99]"
          : ""
      } ${
        variant === "primary"
          ? "border-border/80 bg-gradient-to-b from-warm-white to-soft-sage/30 p-4 sm:p-5 shadow-xs"
          : variant === "warning"
          ? "border-border bg-warm-white p-4 sm:p-5 hover:border-status-warning/40 shadow-xs"
          : variant === "compact"
          ? "border-border bg-warm-white p-3.5"
          : "border-border bg-warm-white p-4 sm:p-5 shadow-xs"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 truncate text-xs font-semibold text-muted" title={label}>
          {label}
        </span>
        {Icon && (
          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
              variant === "warning"
                ? "bg-terracotta-soft/60 text-status-warning group-hover:bg-terracotta-soft"
                : "bg-soft-sand text-muted group-hover:bg-soft-sage group-hover:text-karyalo-green"
            }`}
            aria-hidden="true"
          >
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-1.5 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center gap-1.5 text-muted">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              <span className="text-xs">Memuat...</span>
            </div>
          ) : isError ? (
            <div className="flex items-center gap-1.5 text-status-critical">
              <AlertCircle size={15} aria-hidden="true" />
              <span className="truncate text-xs font-medium" title={errorMessage}>
                {errorMessage}
              </span>
            </div>
          ) : (
            <>
              <span
                className={`truncate font-bold tracking-tight text-ink ${
                  variant === "primary" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                } ${!isAvailable ? "text-ink/40" : ""}`}
                title={String(formattedValue)}
              >
                {formattedValue}
              </span>
              {!isAvailable && (
                <span className="shrink-0 text-xs font-normal text-muted/70">
                  (belum aktif)
                </span>
              )}
            </>
          )}
        </div>

        {statusBadge && !isLoading && !isError && (
          <span className="shrink-0 rounded-md bg-soft-sand px-2 py-0.5 text-xs font-semibold text-muted">
            {statusBadge}
          </span>
        )}
      </div>

      {hint && (
        <p className="mt-1.5 text-xs text-muted leading-tight truncate" title={hint}>
          {hint}
        </p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="tap-target block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-karyalo-green focus-visible:ring-offset-2"
        aria-label={`Buka detail ${label}`}
      >
        {Content}
      </Link>
    );
  }

  return Content;
}
