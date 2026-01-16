import type { HTMLAttributes, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  const baseClassName =
    "rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_12px_40px_rgba(0,0,0,0.55)]";

  return (
    <div
      className={[baseClassName, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
