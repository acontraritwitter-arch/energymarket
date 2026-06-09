import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { clsx, type ClassValue } from "clsx";
import type {
  CommodityCategory,
  GenerationType,
  PilotRegion,
} from "./types";
import { GENERATION_LABELS, REGION_LABELS } from "./constants";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

const nbsp = "\u00A0";

/** Форматирование цены по категории (§2.1) */
export function formatPrice(
  value: number | undefined,
  category: CommodityCategory,
  options?: { priceType?: "text"; text?: string },
): string {
  if (category === "service") {
    if (options?.text) return options.text;
    if (value == null) return "по договорённости";
    return `${formatNumber(value)}${nbsp}₽`;
  }
  if (value == null) return "—";
  const formatted = formatNumber(value);
  if (category === "energy") {
    return `${formatted}${nbsp}₽/МВт·ч`;
  }
  return `${formatted}${nbsp}₽/МВт/мес.`;
}

/** Форматирование объёма (§2.1) */
export function formatVolume(
  value: number | undefined,
  category: CommodityCategory,
): string {
  if (value == null) return "—";
  const formatted = formatNumber(value);
  if (category === "energy") {
    return `${formatted}${nbsp}МВт·ч/час`;
  }
  if (category === "capacity") {
    return `${formatted}${nbsp}МВт`;
  }
  return formatted;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  })
    .format(n)
    .replace(/\s/g, nbsp);
}

/** Склонение по числу */
export function pluralize(
  n: number,
  forms: [string, string, string],
): string {
  const abs = Math.abs(n) % 100;
  const n1 = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
}

export function relativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: ru });
}

export function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function categoryColor(cat: CommodityCategory): string {
  switch (cat) {
    case "energy":
      return "text-energy";
    case "capacity":
      return "text-cap";
    case "service":
      return "text-svc";
  }
}

export function categoryBg(cat: CommodityCategory): string {
  switch (cat) {
    case "energy":
      return "bg-energy-faint";
    case "capacity":
      return "bg-cap-faint";
    case "service":
      return "bg-svc-faint";
  }
}

export function categoryBorder(cat: CommodityCategory): string {
  switch (cat) {
    case "energy":
      return "border-energy";
    case "capacity":
      return "border-cap";
    case "service":
      return "border-svc";
  }
}

export function generationLabel(type: GenerationType): string {
  return GENERATION_LABELS[type];
}

export function regionLabel(region: PilotRegion): string {
  return REGION_LABELS[region];
}

export function formatDateRu(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU");
}

/** Валидация ИНН (10 или 12 цифр) */
export function validateInn(inn: string): string | null {
  const digits = inn.replace(/\D/g, "");
  if (digits.length !== 10 && digits.length !== 12) {
    return "ИНН должен содержать 10 или 12 цифр";
  }
  if (digits.length === 10) {
    const coeffs = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += Number(digits[i]) * coeffs[i]!;
    }
    const check = (sum % 11) % 10;
    if (check !== Number(digits[9])) {
      return "Некорректная контрольная сумма ИНН";
    }
  } else {
    const c1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    const c2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    let s1 = 0;
    for (let i = 0; i < 10; i++) {
      s1 += Number(digits[i]) * c1[i]!;
    }
    const check1 = (s1 % 11) % 10;
    if (check1 !== Number(digits[10])) {
      return "Некорректная контрольная сумма ИНН";
    }
    let s2 = 0;
    for (let i = 0; i < 11; i++) {
      s2 += Number(digits[i]) * c2[i]!;
    }
    const check2 = (s2 % 11) % 10;
    if (check2 !== Number(digits[11])) {
      return "Некорректная контрольная сумма ИНН";
    }
  }
  return null;
}

export function validateOgrn(ogrn: string): string | null {
  const digits = ogrn.replace(/\D/g, "");
  if (digits.length !== 13 && digits.length !== 15) {
    return "ОГРН должен содержать 13 или 15 цифр";
  }
  return null;
}

export function getOfferDisplayPrice(offer: {
  commodity_category: CommodityCategory;
  price?: number;
  capacity_price?: number;
  service_price_text?: string;
  service_price_numeric?: number;
}): { value?: number; text?: string } {
  if (offer.commodity_category === "energy") {
    return { value: offer.price };
  }
  if (offer.commodity_category === "capacity") {
    return { value: offer.capacity_price };
  }
  return {
    value: offer.service_price_numeric,
    text: offer.service_price_text,
  };
}

export function getOfferDisplayVolume(offer: {
  commodity_category: CommodityCategory;
  volume_max?: number;
  volume_min?: number;
  capacity_volume?: number;
}): number | undefined {
  if (offer.commodity_category === "energy") {
    return offer.volume_max ?? offer.volume_min;
  }
  if (offer.commodity_category === "capacity") {
    return offer.capacity_volume;
  }
  return undefined;
}
