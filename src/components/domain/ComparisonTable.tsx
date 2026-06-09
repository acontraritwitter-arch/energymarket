"use client";

import type { CommodityCategory, NegotiationIteration } from "@/lib/types";
import { formatPrice, formatVolume } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Row = { key: string; label: string; values: (string | number | undefined)[] };

function compareBetter(
  category: CommodityCategory,
  key: string,
  prev: number | undefined,
  curr: number | undefined,
  isBuyerPerspective: boolean,
): "better" | "worse" | "same" {
  if (prev == null || curr == null || prev === curr) return "same";
  const priceKeys = ["price", "price_capacity"];
  if (!priceKeys.includes(key)) {
    if (prev === curr) return "same";
    return "same";
  }
  const improved = curr < prev;
  if (isBuyerPerspective) {
    return improved ? "better" : "worse";
  }
  return improved ? "worse" : "better";
}

/** Сравнительная таблица итераций с подсветкой */
export function ComparisonTable({
  iterations,
  category,
  isBuyerPerspective,
}: {
  iterations: NegotiationIteration[];
  category: CommodityCategory;
  isBuyerPerspective: boolean;
}) {
  const sorted = [...iterations].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  if (sorted.length < 2) return null;

  const rows: Row[] = [];
  if (category === "energy") {
    rows.push({
      key: "price",
      label: "Цена",
      values: sorted.map((i) => i.price),
    });
    rows.push({
      key: "vol",
      label: "Объём",
      values: sorted.map((i) => i.volume_energy),
    });
  } else if (category === "capacity") {
    rows.push({
      key: "price_capacity",
      label: "Цена",
      values: sorted.map((i) => i.price_capacity),
    });
    rows.push({
      key: "vol",
      label: "Объём",
      values: sorted.map((i) => i.volume_capacity),
    });
  } else {
    rows.push({
      key: "svc",
      label: "Цена",
      values: sorted.map((i) => i.service_price_text),
    });
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-surface-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-2 text-left text-ink-500">
            <th className="p-2">Параметр</th>
            {sorted.map((it, idx) => (
              <th key={it.id} className="p-2 font-mono">
                Итерация {idx + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t border-surface-border">
              <td className="p-2 font-medium">{row.label}</td>
              {row.values.map((val, idx) => {
                const prev = row.values[idx - 1];
                let cellClass = "";
                if (idx > 0 && typeof val === "number" && typeof prev === "number") {
                  const cmp = compareBetter(
                    category,
                    row.key === "vol" ? "vol" : "price",
                    prev,
                    val,
                    isBuyerPerspective,
                  );
                  if (cmp === "better") cellClass = "bg-green-50 text-green-800";
                  if (cmp === "worse") cellClass = "bg-red-50 text-red-800";
                }
                const display =
                  typeof val === "number" && row.key !== "svc"
                    ? row.key === "vol"
                      ? formatVolume(val, category)
                      : formatPrice(val, category)
                    : String(val ?? "—");
                return (
                  <td key={idx} className={cn("p-2 font-mono", cellClass)}>
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
