type EmptyStateProps = {
  title: string;
  description?: string;
  className?: string;
};

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div className={["text-center", className].filter(Boolean).join(" ")}>
      <div className="text-sm font-semibold text-white">{title}</div>
      {description ? (
        <div className="mt-1 text-xs text-white/60">{description}</div>
      ) : null}
    </div>
  );
}
