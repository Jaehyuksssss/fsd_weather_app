import type { ReactNode } from "react";

type ErrorStateProps = {
  title: string;
  description?: string;
  onRetry?: () => void;
  actions?: ReactNode;
  className?: string;
};

export function ErrorState({
  title,
  description,
  onRetry,
  actions,
  className,
}: ErrorStateProps) {
  const fallbackActions = onRetry ? (
    <button
      type="button"
      onClick={onRetry}
      className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 bg-white/10 px-3 text-sm font-medium text-white hover:bg-white/15"
    >
      다시 시도
    </button>
  ) : null;

  return (
    <div className={["text-center", className].filter(Boolean).join(" ")}>
      <div className="text-sm font-semibold text-white">{title}</div>
      {description ? (
        <div className="mt-1 text-xs text-white/60">{description}</div>
      ) : null}
      {actions ?? fallbackActions ? (
        <div className="mt-4">{actions ?? fallbackActions}</div>
      ) : null}
    </div>
  );
}
