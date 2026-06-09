"use client";

import { useApp } from "@/contexts/AppContext";
import type { CommodityCategory, NegotiationIteration } from "@/lib/types";
import { formatDateRu, formatPrice, formatVolume, relativeDate } from "@/lib/utils";
import { ComparisonTable } from "./ComparisonTable";
import { ChatPanel } from "./ChatPanel";

const actionLabels: Record<string, string> = {
  response: "Отклик",
  accept: "Принятие",
  counter: "Контрпредложение",
  reject: "Отклонение",
  withdraw: "Отзыв",
  terminate: "Прекращение",
};

function renderParams(
  it: NegotiationIteration,
  category: CommodityCategory,
) {
  if (category === "energy") {
    return (
      <p className="font-mono text-sm text-ink-600">
        {formatPrice(it.price, "energy")} ·{" "}
        {formatVolume(it.volume_energy, "energy")} ·{" "}
        {formatDateRu(it.period_start)} — {formatDateRu(it.period_end)}
      </p>
    );
  }
  if (category === "capacity") {
    return (
      <p className="font-mono text-sm text-ink-600">
        {formatPrice(it.price_capacity, "capacity")} ·{" "}
        {formatVolume(it.volume_capacity, "capacity")}
      </p>
    );
  }
  return (
    <p className="text-sm text-ink-600">
      {it.service_price_text} {it.service_terms && `· ${it.service_terms}`}
    </p>
  );
}

/** Хронология переговоров */
export function NegotiationThread({
  responseId,
  category,
  isBuyerPerspective,
}: {
  responseId: string;
  category: CommodityCategory;
  isBuyerPerspective: boolean;
}) {
  const { iterations, users } = useApp();
  const list = iterations
    .filter((i) => i.response_id === responseId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  return (
    <div className="space-y-4">
      <ComparisonTable
        iterations={list}
        category={category}
        isBuyerPerspective={isBuyerPerspective}
      />
      <ul className="space-y-4">
        {list.map((it) => {
          const author = users.find((u) => u.id === it.author_id);
          return (
            <li
              key={it.id}
              className="rounded-lg border border-surface-border bg-surface p-4"
            >
              <div className="flex flex-wrap justify-between gap-2 text-xs text-ink-400">
                <span>{author?.full_name}</span>
                <span>{relativeDate(it.created_at)}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-ink">
                {actionLabels[it.action] ?? it.action}
              </p>
              {renderParams(it, category)}
              {it.comment && (
                <p className="mt-2 text-sm text-ink-500">{it.comment}</p>
              )}
            </li>
          );
        })}
      </ul>
      <ChatPanel responseId={responseId} />
    </div>
  );
}
