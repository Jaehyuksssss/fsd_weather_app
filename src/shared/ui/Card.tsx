import type { HTMLAttributes, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  const baseClassName =
    "rounded-2xl border border-black/10 bg-[#E9E8D4] text-slate-900 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_18px_50px_rgba(0,0,0,0.18)]";

  return (
    <div
      className={[baseClassName, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
