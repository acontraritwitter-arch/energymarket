"use client";

import { useMemo, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PriceChart } from "@/components/domain";
import { Select } from "@/components/ui/Select";
import { useApp } from "@/contexts/AppContext";
import {
  MARKET_PRICES_FUTURE_NOTE,
  PILOT_REGIONS,
  REGION_LABELS,
} from "@/lib/constants";
import type { PilotRegion, ReferencePriceType } from "@/lib/types";
import { formatDateRu, formatPrice, regionLabel } from "@/lib/utils";

export default function MarketPricesPage() {
  const { marketPrices } = useApp();
  const [region, setRegion] = useState<PilotRegion>("moscow_region");
  const [priceType, setPriceType] = useState<ReferencePriceType>("rsv");

  const filtered = useMemo(
    () =>
      marketPrices.filter(
        (mp) => mp.region === region && mp.price_type === priceType,
      ),
    [marketPrices, region, priceType],
  );

  const chartData = filtered.filter((mp) => mp.price_type === "rsv");

  return (
    <PageWrapper title="Справка ОРЭМ">
      <p className="mb-6 max-w-2xl text-sm text-ink-500">
        {MARKET_PRICES_FUTURE_NOTE}
      </p>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Select
          id="region"
          label="Регион"
          value={region}
          onChange={(e) => setRegion(e.target.value as PilotRegion)}
          options={PILOT_REGIONS.map((r) => ({
            value: r,
            label: REGION_LABELS[r],
          }))}
        />
        <Select
          id="price_type"
          label="Тип справочной цены"
          value={priceType}
          onChange={(e) =>
            setPriceType(e.target.value as ReferencePriceType)
          }
          options={[
            { value: "rsv", label: "РСВ (электроэнергия)" },
            { value: "capacity", label: "Мощность" },
          ]}
        />
      </div>

      <div className="rounded-xl border border-surface-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">
          Динамика цен — {regionLabel(region)}
        </h2>
        <PriceChart data={priceType === "rsv" ? chartData : filtered} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-surface-border">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-surface-border bg-surface-2 text-xs text-ink-400">
            <tr>
              <th className="px-4 py-3">Период</th>
              <th className="px-4 py-3">Цена</th>
              <th className="px-4 py-3">Источник</th>
              <th className="px-4 py-3">Загружено</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-400">
                  Нет данных для выбранных параметров
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="border-b border-surface-border last:border-0">
                  <td className="px-4 py-3">{row.period}</td>
                  <td className="px-4 py-3 font-mono">
                    {formatPrice(
                      row.price,
                      row.price_type === "capacity" ? "capacity" : "energy",
                    )}
                  </td>
                  <td className="px-4 py-3">{row.source}</td>
                  <td className="px-4 py-3 text-ink-400">
                    {new Date(row.uploaded_at).toLocaleDateString("ru-RU")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
