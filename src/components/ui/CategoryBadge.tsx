import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/lib/constants";
import type { CommodityCategory } from "@/lib/types";
import { categoryBg, categoryBorder, cn } from "@/lib/utils";

/** Бейдж товарной категории ⚡ / 🔋 / 🔧 */
export function CategoryBadge({
  category,
  size = "md",
  showLabel = true,
}: {
  category: CommodityCategory;
  size?: "sm" | "md";
  showLabel?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border font-medium",
        categoryBg(category),
        categoryBorder(category),
        size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm",
      )}
    >
      <span aria-hidden>{CATEGORY_ICONS[category]}</span>
      {showLabel && (
        <span className="hidden sm:inline">{CATEGORY_LABELS[category]}</span>
      )}
    </span>
  );
}

/** Бейдж направления Продажа / Покупка */
export function DirectionBadge({ direction }: { direction: "sell" | "buy" }) {
  const isSell = direction === "sell";
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
        isSell ? "bg-sell-faint text-sell" : "bg-buy-faint text-buy",
      )}
    >
      {isSell ? "Продажа" : "Покупка"}
    </span>
  );
}
