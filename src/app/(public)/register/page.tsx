"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  PARTICIPANT_ROLES,
  PILOT_REGIONS,
  PRICE_CATEGORY_OPTIONS,
  REGION_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  ROLE_IDS,
} from "@/lib/constants";
import type { ParticipantRole, PilotRegion, PriceCategory } from "@/lib/types";
import { validateInn, validateOgrn } from "@/lib/utils";
import { GENERATION_LABELS } from "@/lib/constants";
import { useApp } from "@/contexts/AppContext";
import { createNotification } from "@/lib/app-actions";

/** Мастер регистрации (3 шага) */
export default function RegisterPage() {
  const { dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState<string | null>(null);
  const [role, setRole] = useState<ParticipantRole | null>(null);
  const [form, setForm] = useState({
    name: "",
    inn: "",
    ogrn: "",
    region: "" as PilotRegion | "",
    contact: "",
    email: "",
    phone: "",
    price_category: "" as PriceCategory | "",
    max_power: "",
    generation_type: "",
    installed_capacity: "",
    orem_contract: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Обязательное поле";
    const innErr = validateInn(form.inn);
    if (innErr) e.inn = innErr;
    const ogrnErr = validateOgrn(form.ogrn);
    if (ogrnErr) e.ogrn = ogrnErr;
    if (!form.region) e.region = "Выберите регион";
    if (!form.contact) e.contact = "Обязательное поле";
    if (!form.email) e.email = "Обязательное поле";
    if (!form.phone) e.phone = "Обязательное поле";
    if (!form.consent) e.consent = "Необходимо согласие";
    if (role === "consumer") {
      if (!form.price_category) e.price_category = "Обязательно для потребителя";
      if (!form.max_power) e.max_power = "Обязательное поле";
    }
    if (role === "producer_wholesale" || role === "producer_retail") {
      if (!form.generation_type) e.generation_type = "Обязательное поле";
      if (!form.installed_capacity) e.installed_capacity = "Обязательное поле";
    }
    if (role === "producer_wholesale" && !form.orem_contract) {
      e.orem_contract = "Обязательно для R03";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    const app = {
      id: `app_${Date.now()}`,
      application_number: `ЗАЯВ-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      role: role!,
      organization_name: form.name,
      inn: form.inn,
      ogrn: form.ogrn,
      region: form.region as PilotRegion,
      contact_full_name: form.contact,
      email: form.email,
      phone: form.phone,
      price_category: form.price_category || undefined,
      max_power: form.max_power ? Number(form.max_power) : undefined,
      generation_type: form.generation_type as import("@/lib/types").GenerationType | undefined,
      installed_capacity: form.installed_capacity
        ? Number(form.installed_capacity)
        : undefined,
      orem_contract_number: form.orem_contract || undefined,
      status: "pending_review" as const,
      created_at: new Date().toISOString(),
    };
    dispatch({ type: "ADD_REGISTRATION", app });
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: createNotification({
        user_id: "user_operator",
        type: "N01",
        title: "Новая заявка на присоединение",
        body: `Заявка ${app.application_number} от ${form.name}`,
        related_entity_type: "registration",
        related_entity_id: app.id,
        is_read: false,
        channel: "system_email",
        category_filter: "system",
      }),
    });
    setDone(app.application_number);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Заявка принята</h1>
        <p className="mt-4 text-ink-500">
          Номер заявки: <span className="font-mono font-semibold">{done}</span>
        </p>
        <p className="mt-2 text-sm text-ink-400">
          Ожидайте решения оператора площадки.
        </p>
        <Link href="/" className="mt-8 inline-block text-energy">
          На главную
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="text-sm text-energy">
        ← На главную
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Заявка на присоединение</h1>
      <p className="mt-2 text-sm text-ink-500">Шаг {step} из 3</p>
      <div className="mt-4 h-2 rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-energy transition-all"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {step === 1 && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {PARTICIPANT_ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-xl border-2 p-4 text-left ${
                role === r ? "border-energy bg-energy-faint" : "border-surface-border"
              }`}
            >
              <p className="font-semibold">
                {ROLE_IDS[r]} · {ROLE_LABELS[r]}
              </p>
              <p className="mt-1 text-xs text-ink-500">
                {ROLE_DESCRIPTIONS[r as keyof typeof ROLE_DESCRIPTIONS]}
              </p>
            </button>
          ))}
          <div className="sm:col-span-2 mt-4 flex justify-end">
            <Button type="button" disabled={!role} onClick={() => setStep(2)}>
              Далее
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Input
            label="Наименование организации"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label="ИНН"
            value={form.inn}
            onChange={(e) => setForm({ ...form, inn: e.target.value })}
            error={errors.inn}
          />
          <Input
            label="ОГРН"
            value={form.ogrn}
            onChange={(e) => setForm({ ...form, ogrn: e.target.value })}
            error={errors.ogrn}
          />
          <Select
            id="region"
            label="Регион деятельности"
            value={form.region}
            onChange={(e) =>
              setForm({ ...form, region: e.target.value as PilotRegion })
            }
            options={[
              { value: "", label: "—" },
              ...PILOT_REGIONS.map((r) => ({
                value: r,
                label: REGION_LABELS[r],
              })),
            ]}
            error={errors.region}
          />
          <Input
            label="ФИО контактного лица"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            error={errors.contact}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
          <Input
            label="Телефон"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            error={errors.phone}
          />
          {role === "consumer" && (
            <>
              <Select
                id="price_cat"
                label="Ценовая категория"
                value={form.price_category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price_category: e.target.value as PriceCategory,
                  })
                }
                options={PRICE_CATEGORY_OPTIONS.map((v) => ({
                  value: v,
                  label: v,
                }))}
                error={errors.price_category}
              />
              <Input
                label="Макс. мощность ЭПУ, МВт"
                type="number"
                value={form.max_power}
                onChange={(e) => setForm({ ...form, max_power: e.target.value })}
                error={errors.max_power}
              />
            </>
          )}
          {(role === "producer_wholesale" || role === "producer_retail") && (
            <>
              <Select
                id="gen"
                label="Вид генерации"
                value={form.generation_type}
                onChange={(e) =>
                  setForm({ ...form, generation_type: e.target.value })
                }
                options={[
                  { value: "", label: "—" },
                  ...Object.entries(GENERATION_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  })),
                ]}
                error={errors.generation_type}
              />
              <Input
                label="Установленная мощность, МВт"
                type="number"
                value={form.installed_capacity}
                onChange={(e) =>
                  setForm({ ...form, installed_capacity: e.target.value })
                }
                error={errors.installed_capacity}
              />
            </>
          )}
          {role === "producer_wholesale" && (
            <Input
              label="Номер договора ОРЭМ"
              value={form.orem_contract}
              onChange={(e) =>
                setForm({ ...form, orem_contract: e.target.value })
              }
              error={errors.orem_contract}
            />
          )}
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            />
            Согласие с условиями присоединения
          </label>
          {errors.consent && (
            <p className="text-xs text-error md:col-span-2">{errors.consent}</p>
          )}
          <div className="flex gap-2 md:col-span-2">
            <Button variant="secondary" type="button" onClick={() => setStep(1)}>
              Назад
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (validateStep2()) setStep(3);
              }}
            >
              Далее
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-8 space-y-4 rounded-xl border border-surface-border p-6">
          <p>
            <strong>Роль:</strong> {role && ROLE_LABELS[role]}
          </p>
          <p>
            <strong>Организация:</strong> {form.name}
          </p>
          <p>
            <strong>ИНН / ОГРН:</strong> {form.inn} / {form.ogrn}
          </p>
          <p>
            <strong>Регион:</strong>{" "}
            {form.region && REGION_LABELS[form.region as PilotRegion]}
          </p>
          <p>
            <strong>Контакты:</strong> {form.contact}, {form.email}, {form.phone}
          </p>
          <div className="flex gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => setStep(2)}>
              Назад
            </Button>
            <Button type="button" onClick={submit}>
              Отправить заявку
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
