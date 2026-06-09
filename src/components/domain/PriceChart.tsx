"use client";

import type { MarketPrice } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

/** Линейный график динамики РСВ (inline SVG) */
export function PriceChart({ data }: { data: MarketPrice[] }) {
  const sorted = [...data].sort((a, b) => a.period.localeCompare(b.period));
  if (sorted.length < 2) {
    return (
      <p className="text-sm text-ink-400">Недостаточно данных для графика</p>
    );
  }
  const prices = sorted.map((d) => d.price);
  const min = Math.min(...prices) * 0.98;
  const max = Math.max(...prices) * 1.02;
  const w = 400;
  const h = 160;
  const pad = 24;
  const points = sorted
    .map((d, i) => {
      const x = pad + (i / (sorted.length - 1)) * (w - pad * 2);
      const y =
        pad + (1 - (d.price - min) / (max - min)) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg" role="img" aria-label="График цен РСВ">
        <polyline
          fill="none"
          stroke="#1A8FE3"
          strokeWidth="2"
          points={points}
        />
        {sorted.map((d, i) => {
          const x = pad + (i / (sorted.length - 1)) * (w - pad * 2);
          const y =
            pad + (1 - (d.price - min) / (max - min)) * (h - pad * 2);
          return (
            <circle key={d.id} cx={x} cy={y} r="3" fill="#1A8FE3" />
          );
        })}
      </svg>
      <p className="mt-2 font-mono text-xs text-ink-400">
        Последнее: {formatNumber(sorted[sorted.length - 1]!.price)} ₽/МВт·ч
      </p>
    </div>
  );
}
