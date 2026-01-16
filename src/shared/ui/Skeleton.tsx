type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "animate-pulse rounded-md bg-white/10",
        className ?? "h-4 w-full",
      ].join(" ")}
    />
  );
}
