type SectionTitleProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function SectionTitle({
  title,
  subtitle,
  className,
}: SectionTitleProps) {
  return (
    <div className={className}>
      <div className="text-sm font-semibold tracking-tight">{title}</div>
      {subtitle ? (
        <div className="mt-1 text-xs opacity-70">{subtitle}</div>
      ) : null}
    </div>
  );
}
