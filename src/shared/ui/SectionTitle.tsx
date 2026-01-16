import type { ReactNode } from "react";

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  className?: string;
  icon?: ReactNode;
};

export function SectionTitle({
  title,
  subtitle,
  className,
  icon,
}: SectionTitleProps) {
  return (
    <div
      className={["flex items-end gap-3", className].filter(Boolean).join(" ")}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {icon ? (
            <span
              aria-hidden="true"
              className="grid h-6 w-6 place-items-center rounded-lg bg-white/10 text-white/90"
            >
              {icon}
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-white/40"
            />
          )}
          <div className="text-sm font-semibold tracking-tight text-white">
            {title}
          </div>
        </div>
        {subtitle ? (
          <div className="mt-1 text-xs text-white/60">{subtitle}</div>
        ) : null}
      </div>

      <div
        aria-hidden="true"
        className="mb-2 flex-1 border-t border-white/10"
      />
    </div>
  );
}
