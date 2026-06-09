import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

/** Нейтральный бейдж */
export function Badge({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-ink-50 text-ink-600",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
