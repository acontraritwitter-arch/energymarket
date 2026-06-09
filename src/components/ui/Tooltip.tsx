import type { ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
}

/** Простая подсказка при наведении */
export function Tooltip({ content, children }: TooltipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-max max-w-xs -translate-x-1/2 rounded-md bg-ink px-2 py-1 text-xs text-white group-hover:block"
      >
        {content}
      </span>
    </span>
  );
}
