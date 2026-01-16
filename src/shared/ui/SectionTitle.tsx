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
      <div className="text-sm font-semibold tracking-tight text-white">
        {title}
      </div>
      {subtitle ? (
        <div className="mt-1 text-xs text-white/60">{subtitle}</div>
      ) : null}
    </div>
  );
}
