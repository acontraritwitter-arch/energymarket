"use client";

import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string; badge?: number }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

/** Горизонтальные табы */
export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div
      className={cn("flex flex-wrap gap-1 border-b border-surface-border", className)}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2",
            active === tab.id
              ? "border-energy text-energy"
              : "border-transparent text-ink-400 hover:text-ink-600",
          )}
        >
          {tab.label}
          {tab.badge != null && tab.badge > 0 && (
            <span className="ml-1.5 rounded-full bg-energy px-1.5 py-0.5 text-[10px] text-white">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
