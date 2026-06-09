"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Step1Category } from "@/components/domain/OfferForm/Step1Category";
import {
  Step2Params,
  type OfferFormState,
} from "@/components/domain/OfferForm/Step2Params";
import { Step3Preview } from "@/components/domain/OfferForm/Step3Preview";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/contexts/AppContext";
import { useRole } from "@/hooks";
import type { CommodityCategory, Direction, Offer } from "@/lib/types";

const emptyForm: OfferFormState = {
  region: [],
  has_green_attrs: false,
};

function parseNum(v?: string) {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default function NewOfferPage() {
  const router = useRouter();
  const { dispatch, currentUser, currentOrganization } = useApp();
  const { availableOfferTypes } = useRole();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<{
    category: CommodityCategory;
    direction: Direction;
  } | null>(null);
  const [form, setForm] = useState<OfferFormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const previewOffer = useMemo((): Offer | null => {
    if (!selected) return null;
    const now = new Date().toISOString();
    return {
      id: "preview",
      author_id: currentUser.id,
      organization_id: currentOrganization.id,
      commodity_category: selected.category,
      direction: selected.direction,
      status: "draft",
      region: form.region,
      generation_type: form.generation_type,
      generation_object: form.generation_object,
      price_type: form.price_type,
      price: parseNum(form.price),
      price_peak: parseNum(form.price_peak),
      price_semipeak: parseNum(form.price_semipeak),
      price_offpeak: parseNum(form.price_offpeak),
      volume_min: parseNum(form.volume_min),
      volume_max: parseNum(form.volume_max),
      period_start: form.period_start,
      period_end: form.period_end,
      delivery_profile: form.delivery_profile,
      capacity_price: parseNum(form.capacity_price),
      capacity_volume: parseNum(form.capacity_volume),
      capacity_price_type: form.capacity_price_type,
      min_contract_months: parseNum(form.min_contract_months),
      service_category: form.service_category,
      service_description: form.service_description,
      service_price_text: form.service_price_text,
      service_price_numeric: parseNum(form.service_price_numeric),
      service_unit: form.service_unit,
      has_green_attrs: form.has_green_attrs,
      description: form.description,
      valid_until: form.valid_until ?? now.slice(0, 10),
      created_at: now,
    };
  }, [selected, form, currentUser, currentOrganization]);

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!selected) return false;
    if (form.region.length === 0) e.region = "Выберите хотя бы один регион";
    if (!form.valid_until) e.valid_until = "Укажите срок действия";
    if (selected.category === "energy") {
      if (!form.price && selected.direction === "sell") e.price = "Обязательное поле";
      if (!form.volume_max) e.volume_max = "Обязательное поле";
    }
    if (selected.category === "capacity") {
      if (!form.capacity_price) e.capacity_price = "Обязательное поле";
      if (!form.capacity_volume) e.capacity_volume = "Обязательное поле";
    }
    if (selected.category === "service") {
      if (!form.service_category) e.service_category = "Обязательное поле";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = (draft: boolean) => {
    if (!previewOffer) return;
    const offer: Offer = {
      ...previewOffer,
      id: `offer_${Date.now()}`,
      status: draft ? "draft" : "active",
      published_at: draft ? undefined : new Date().toISOString(),
    };
    dispatch({ type: "ADD_OFFER", offer });
    router.push("/offers");
  };

  return (
    <PageWrapper title="Новое предложение">
      <div className="mb-6 flex gap-2 text-sm">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={
              step === n
                ? "font-semibold text-energy"
                : step > n
                  ? "text-ink-500"
                  : "text-ink-300"
            }
          >
            Шаг {n}
          </span>
        ))}
      </div>

      {step === 1 && (
        <>
          <Step1Category
            available={availableOfferTypes}
            selected={selected}
            onSelect={(v) => {
              setSelected(v);
              setForm(emptyForm);
            }}
          />
          <div className="mt-6 flex justify-end">
            <Button disabled={!selected} onClick={() => setStep(2)}>
              Далее
            </Button>
          </div>
        </>
      )}

      {step === 2 && selected && (
        <>
          <Step2Params
            category={selected.category}
            direction={selected.direction}
            form={form}
            onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
            errors={errors}
          />
          <div className="mt-6 flex justify-between">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Назад
            </Button>
            <Button
              onClick={() => {
                if (validateStep2()) setStep(3);
              }}
            >
              К&nbsp;предпросмотру
            </Button>
          </div>
        </>
      )}

      {step === 3 && previewOffer && (
        <>
          <Step3Preview offer={previewOffer} />
          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <Button variant="secondary" onClick={() => setStep(2)}>
              Назад
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => save(true)}>
                Сохранить черновик
              </Button>
              <Button onClick={() => save(false)}>Опубликовать</Button>
            </div>
          </div>
        </>
      )}
    </PageWrapper>
  );
}
