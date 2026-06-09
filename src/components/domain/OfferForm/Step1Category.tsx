"use client";

import { CATEGORY_ICONS, CATEGORY_LABELS, DIRECTION_LABELS } from "@/lib/constants";
import type { CommodityCategory, Direction } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Шаг 1 мастера — категория и направление */
export function Step1Category({
  available,
  selected,
  onSelect,
}: {
  available: { category: CommodityCategory; direction: Direction }[];
  selected: { category: CommodityCategory; direction: Direction } | null;
  onSelect: (v: { category: CommodityCategory; direction: Direction }) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {available.map((item) => {
        const active =
          selected?.category === item.category &&
          selected?.direction === item.direction;
        return (
          <button
            key={`${item.category}_${item.direction}`}
            type="button"
            onClick={() => onSelect(item)}
            className={cn(
              "rounded-xl border-2 p-6 text-left transition-all",
              active
                ? "border-energy bg-energy-faint shadow-md"
                : "border-surface-border hover:border-energy/50",
            )}
          >
            <span className="text-2xl">{CATEGORY_ICONS[item.category]}</span>
            <p className="mt-2 font-semibold text-ink">
              {CATEGORY_LABELS[item.category]}
            </p>
            <p className="text-sm text-ink-500">
              {DIRECTION_LABELS[item.direction]}
            </p>
          </button>
        );
      })}
    </div>
  );
}
