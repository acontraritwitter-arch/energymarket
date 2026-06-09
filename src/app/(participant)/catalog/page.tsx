"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { OfferCard } from "@/components/domain";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { useApp } from "@/contexts/AppContext";
import { usePageLoading } from "@/hooks";
import {
  CATEGORY_LABELS,
  DIRECTION_LABELS,
  GENERATION_LABELS,
  PILOT_REGIONS,
  REGION_LABELS,
} from "@/lib/constants";
import type { CommodityCategory, Direction, GenerationType, Offer } from "@/lib/types";
import {
  getOfferDisplayPrice,
  getOfferDisplayVolume,
} from "@/lib/utils";

const PAGE_SIZE = 6;

type SortKey = "published_desc" | "published_asc" | "price_asc" | "price_desc" | "volume_asc" | "valid_asc";

export default function CatalogPage() {
  const { offers } = useApp();
  const loading = usePageLoading();
  const [categoryTab, setCategoryTab] = useState<"all" | CommodityCategory>("all");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [direction, setDirection] = useState<Direction | "">("");
  const [region, setRegion] = useState<string>("");
  const [generation, setGeneration] = useState<GenerationType | "">("");
  const [greenOnly, setGreenOnly] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState<SortKey>("published_desc");
  const [page, setPage] = useState(1);

  const catalogTabs = [
    { id: "all", label: "Все" },
    { id: "energy", label: CATEGORY_LABELS.energy },
    { id: "capacity", label: CATEGORY_LABELS.capacity },
    { id: "service", label: CATEGORY_LABELS.service },
  ];

  const filtered = useMemo(() => {
    let list = offers.filter(
      (o) => o.status === "active" && !o.hidden_by_operator,
    );
    if (categoryTab !== "all") {
      list = list.filter((o) => o.commodity_category === categoryTab);
    }
    if (direction) list = list.filter((o) => o.direction === direction);
    if (region) list = list.filter((o) => o.region.includes(region as Offer["region"][number]));
    if (generation) list = list.filter((o) => o.generation_type === generation);
    if (greenOnly) list = list.filter((o) => o.has_green_attrs);
    const pMin = Number(priceMin);
    const pMax = Number(priceMax);
    if (priceMin || priceMax) {
      list = list.filter((o) => {
        const p = getOfferDisplayPrice(o).value ?? 0;
        if (priceMin && p < pMin) return false;
        if (priceMax && p > pMax) return false;
        return true;
      });
    }

    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case "published_asc":
          return (
            new Date(a.published_at ?? a.created_at).getTime() -
            new Date(b.published_at ?? b.created_at).getTime()
          );
        case "price_asc": {
          const pa = getOfferDisplayPrice(a).value ?? 0;
          const pb = getOfferDisplayPrice(b).value ?? 0;
          return pa - pb;
        }
        case "price_desc": {
          const pa = getOfferDisplayPrice(a).value ?? 0;
          const pb = getOfferDisplayPrice(b).value ?? 0;
          return pb - pa;
        }
        case "volume_asc": {
          const va = getOfferDisplayVolume(a) ?? 0;
          const vb = getOfferDisplayVolume(b) ?? 0;
          return va - vb;
        }
        case "valid_asc":
          return (
            new Date(a.valid_until).getTime() - new Date(b.valid_until).getTime()
          );
        case "published_desc":
        default:
          return (
            new Date(b.published_at ?? b.created_at).getTime() -
            new Date(a.published_at ?? a.created_at).getTime()
          );
      }
    });
    return sorted;
  }, [
    offers,
    categoryTab,
    direction,
    region,
    generation,
    greenOnly,
    priceMin,
    priceMax,
    sort,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageWrapper title="Каталог предложений">
      <div className="sticky top-0 z-20 -mx-4 border-b border-surface-border bg-surface-2/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <Tabs
          tabs={catalogTabs}
          active={categoryTab}
          onChange={(id) => {
            setCategoryTab(id as typeof categoryTab);
            setPage(1);
          }}
        />
      </div>

      <div className="mt-4 rounded-xl border border-surface-border bg-surface">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-ink"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
        >
          Фильтры
          {filtersOpen ? (
            <ChevronUp className="h-4 w-4 text-ink-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-ink-400" />
          )}
        </button>
        {filtersOpen && (
          <div className="grid gap-4 border-t border-surface-border p-4 md:grid-cols-2 lg:grid-cols-4">
            <Select
              id="direction"
              label="Направление"
              value={direction}
              onChange={(e) => {
                setDirection(e.target.value as Direction | "");
                setPage(1);
              }}
              options={[
                { value: "", label: "Любое" },
                ...(["sell", "buy"] as Direction[]).map((d) => ({
                  value: d,
                  label: DIRECTION_LABELS[d],
                })),
              ]}
            />
            <Select
              id="region"
              label="Регион"
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "Любой" },
                ...PILOT_REGIONS.map((r) => ({
                  value: r,
                  label: REGION_LABELS[r],
                })),
              ]}
            />
            <Select
              id="generation"
              label="Вид генерации"
              value={generation}
              onChange={(e) => {
                setGeneration(e.target.value as GenerationType | "");
                setPage(1);
              }}
              options={[
                { value: "", label: "Любой" },
                ...Object.entries(GENERATION_LABELS).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
            />
            <div className="flex flex-col gap-2">
              <Input
                id="price_min"
                label="Цена от"
                type="number"
                value={priceMin}
                onChange={(e) => {
                  setPriceMin(e.target.value);
                  setPage(1);
                }}
              />
              <Input
                id="price_max"
                label="Цена до"
                type="number"
                value={priceMax}
                onChange={(e) => {
                  setPriceMax(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-600 md:col-span-2">
              <input
                type="checkbox"
                checked={greenOnly}
                onChange={(e) => {
                  setGreenOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-surface-border"
              />
              Только с&nbsp;атрибутами генерации
            </label>
            <Select
              id="sort"
              label="Сортировка"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              options={[
                { value: "published_desc", label: "Сначала новые" },
                { value: "published_asc", label: "Сначала старые" },
                { value: "price_asc", label: "Цена по возрастанию" },
                { value: "price_desc", label: "Цена по убыванию" },
                { value: "volume_asc", label: "Объём по возрастанию" },
                { value: "valid_asc", label: "Срок действия — скоро истекает" },
              ]}
            />
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-ink-400">
        Найдено: {filtered.length}{" "}
        {filtered.length === 1 ? "предложение" : "предложений"}
      </p>

      {loading ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : pageItems.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink-400">
          По&nbsp;выбранным фильтрам предложений не&nbsp;найдено
        </p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((offer) => (
            <OfferCard key={offer.id} offer={offer} showResponseCount />
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Назад
          </Button>
          <span className="text-sm text-ink-500">
            Страница {page} из {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Вперёд
          </Button>
        </div>
      )}
    </PageWrapper>
  );
}
