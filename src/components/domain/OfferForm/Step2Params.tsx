"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  DELIVERY_PROFILE_LABELS,
  GENERATION_LABELS,
  PILOT_REGIONS,
  REGION_LABELS,
  SERVICE_CATEGORY_LABELS,
} from "@/lib/constants";
import type {
  CommodityCategory,
  DeliveryProfile,
  Direction,
  GenerationType,
  PilotRegion,
  PriceType,
  ServiceCategory,
} from "@/lib/types";

export type OfferFormState = {
  generation_type?: GenerationType;
  generation_object?: string;
  region: PilotRegion[];
  price_type?: PriceType;
  price?: string;
  price_peak?: string;
  price_semipeak?: string;
  price_offpeak?: string;
  volume_min?: string;
  volume_max?: string;
  period_start?: string;
  period_end?: string;
  delivery_profile?: DeliveryProfile;
  has_green_attrs: boolean;
  description?: string;
  valid_until?: string;
  capacity_price?: string;
  capacity_volume?: string;
  capacity_price_type?: PriceType;
  min_contract_months?: string;
  service_category?: ServiceCategory;
  service_description?: string;
  service_price_text?: string;
  service_price_numeric?: string;
  service_unit?: string;
};

/** Шаг 2 — параметры предложения */
export function Step2Params({
  category,
  direction,
  form,
  onChange,
  errors,
}: {
  category: CommodityCategory;
  direction: Direction;
  form: OfferFormState;
  onChange: (patch: Partial<OfferFormState>) => void;
  errors: Record<string, string>;
}) {
  const genOptions = Object.entries(GENERATION_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
  const regionToggle = (r: PilotRegion) => {
    const set = new Set(form.region);
    if (set.has(r)) set.delete(r);
    else set.add(r);
    onChange({ region: [...set] });
  };

  if (category === "energy") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {direction === "sell" && (
          <Select
            id="generation_type"
            label="Вид генерации"
            value={form.generation_type ?? ""}
            onChange={(e) =>
              onChange({
                generation_type: e.target.value as GenerationType,
              })
            }
            options={[{ value: "", label: "—" }, ...genOptions]}
            error={errors.generation_type}
          />
        )}
        <Input
          label="Наименование объекта"
          value={form.generation_object ?? ""}
          onChange={(e) => onChange({ generation_object: e.target.value })}
        />
        <div className="md:col-span-2">
          <p className="mb-2 text-sm font-medium">Регион поставки</p>
          <div className="flex flex-wrap gap-2">
            {PILOT_REGIONS.map((r) => (
              <label key={r} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={form.region.includes(r)}
                  onChange={() => regionToggle(r)}
                />
                {REGION_LABELS[r]}
              </label>
            ))}
          </div>
          {errors.region && (
            <p className="text-xs text-error">{errors.region}</p>
          )}
        </div>
        <Select
          id="price_type"
          label="Тип цены"
          value={form.price_type ?? "fixed"}
          onChange={(e) =>
            onChange({ price_type: e.target.value as PriceType })
          }
          options={[
            { value: "fixed", label: "Фиксированная" },
            { value: "indexed", label: "Индексируемая" },
            { value: "zonal", label: "Зонная" },
          ]}
        />
        {form.price_type !== "zonal" ? (
          <Input
            label="Цена, ₽/МВт·ч"
            type="number"
            value={form.price ?? ""}
            onChange={(e) => onChange({ price: e.target.value })}
            error={errors.price}
          />
        ) : (
          <>
            <Input
              label="Цена (пик)"
              type="number"
              value={form.price_peak ?? ""}
              onChange={(e) => onChange({ price_peak: e.target.value })}
            />
            <Input
              label="Цена (полупик)"
              type="number"
              value={form.price_semipeak ?? ""}
              onChange={(e) => onChange({ price_semipeak: e.target.value })}
            />
            <Input
              label="Цена (ночь)"
              type="number"
              value={form.price_offpeak ?? ""}
              onChange={(e) => onChange({ price_offpeak: e.target.value })}
            />
          </>
        )}
        <Input
          label="Мин. объём, МВт·ч/час"
          type="number"
          value={form.volume_min ?? ""}
          onChange={(e) => onChange({ volume_min: e.target.value })}
        />
        <Input
          label="Макс. объём, МВт·ч/час"
          type="number"
          value={form.volume_max ?? ""}
          onChange={(e) => onChange({ volume_max: e.target.value })}
          error={errors.volume}
        />
        <Input
          label="Начало периода поставки"
          type="date"
          value={form.period_start ?? ""}
          onChange={(e) => onChange({ period_start: e.target.value })}
          error={errors.period_start}
        />
        <Input
          label="Окончание периода"
          type="date"
          value={form.period_end ?? ""}
          onChange={(e) => onChange({ period_end: e.target.value })}
          error={errors.period_end}
        />
        <Select
          id="delivery_profile"
          label="Профиль поставки"
          value={form.delivery_profile ?? "base"}
          onChange={(e) =>
            onChange({
              delivery_profile: e.target.value as DeliveryProfile,
            })
          }
          options={Object.entries(DELIVERY_PROFILE_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={form.has_green_attrs}
            onChange={(e) => onChange({ has_green_attrs: e.target.checked })}
          />
          Атрибуты генерации
        </label>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Дополнительные условия</label>
          <textarea
            className="mt-1 w-full rounded-lg border border-surface-border p-2 text-sm"
            rows={3}
            value={form.description ?? ""}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>
        <Input
          label="Срок действия предложения"
          type="date"
          value={form.valid_until ?? ""}
          onChange={(e) => onChange({ valid_until: e.target.value })}
          error={errors.valid_until}
        />
      </div>
    );
  }

  if (category === "capacity") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          id="cap_gen"
          label="Вид генерации"
          value={form.generation_type ?? ""}
          onChange={(e) =>
            onChange({ generation_type: e.target.value as GenerationType })
          }
          options={[{ value: "", label: "—" }, ...genOptions]}
        />
        <Input
          label="Наименование объекта"
          value={form.generation_object ?? ""}
          onChange={(e) => onChange({ generation_object: e.target.value })}
        />
        <Input
          label="Цена, ₽/МВт/мес."
          type="number"
          value={form.capacity_price ?? ""}
          onChange={(e) => onChange({ capacity_price: e.target.value })}
        />
        <Select
          id="cap_price_type"
          label="Тип ценообразования"
          value={form.capacity_price_type ?? "fixed"}
          onChange={(e) =>
            onChange({ capacity_price_type: e.target.value as PriceType })
          }
          options={[
            { value: "fixed", label: "Фиксированная" },
            { value: "indexed", label: "Индексируемая" },
          ]}
        />
        <Input
          label="Объём, МВт"
          type="number"
          value={form.capacity_volume ?? ""}
          onChange={(e) => onChange({ capacity_volume: e.target.value })}
        />
        <Input
          label="Мин. срок договора, мес."
          type="number"
          value={form.min_contract_months ?? ""}
          onChange={(e) => onChange({ min_contract_months: e.target.value })}
        />
        <Input label="Период с" type="date" value={form.period_start ?? ""} onChange={(e) => onChange({ period_start: e.target.value })} />
        <Input label="Период по" type="date" value={form.period_end ?? ""} onChange={(e) => onChange({ period_end: e.target.value })} />
        <Input label="Срок действия" type="date" value={form.valid_until ?? ""} onChange={(e) => onChange({ valid_until: e.target.value })} />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Select
        id="service_category"
        label="Категория услуги"
        value={form.service_category ?? ""}
        onChange={(e) =>
          onChange({ service_category: e.target.value as ServiceCategory })
        }
        options={[
          { value: "", label: "—" },
          ...Object.entries(SERVICE_CATEGORY_LABELS).map(([value, label]) => ({
            value,
            label,
          })),
        ]}
      />
      <div className="md:col-span-2">
        <label className="text-sm font-medium">Описание</label>
        <textarea
          className="mt-1 w-full rounded-lg border border-surface-border p-2 text-sm"
          rows={4}
          value={form.service_description ?? ""}
          onChange={(e) => onChange({ service_description: e.target.value })}
        />
      </div>
      <Input
        label="Цена (текст)"
        value={form.service_price_text ?? ""}
        onChange={(e) => onChange({ service_price_text: e.target.value })}
      />
      <Input
        label="Числовое значение (необяз.)"
        type="number"
        value={form.service_price_numeric ?? ""}
        onChange={(e) => onChange({ service_price_numeric: e.target.value })}
      />
      <Input
        label="Единица измерения"
        value={form.service_unit ?? ""}
        onChange={(e) => onChange({ service_unit: e.target.value })}
      />
      <Input
        label="Срок действия"
        type="date"
        value={form.valid_until ?? ""}
        onChange={(e) => onChange({ valid_until: e.target.value })}
      />
    </div>
  );
}
