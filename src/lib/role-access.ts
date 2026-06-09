import type {
  CommodityCategory,
  Direction,
  ParticipantRole,
} from "./types";

type MatrixKey = `${CommodityCategory}_${Direction}`;

/** Матрица canCreate по §3.2 tz.md */
const CREATE_MATRIX: Partial<Record<ParticipantRole, MatrixKey[]>> = {
  consumer: ["energy_buy", "capacity_buy", "service_buy"],
  producer_wholesale: [
    "energy_sell",
    "capacity_sell",
    "service_buy",
  ],
  producer_retail: ["energy_sell", "capacity_sell", "service_buy"],
  energy_sales: [
    "energy_sell",
    "energy_buy",
    "capacity_buy",
    "service_buy",
  ],
  demand_aggregator: ["service_sell"],
  service_provider: ["service_sell"],
};

/**
 * Отклик: строка матрицы «Отклик на …» — кто может откликаться на offer с данной категорией и направлением.
 * sell offer → buyers respond; buy offer → sellers respond.
 */
const RESPOND_ON_SELL_ENERGY: ParticipantRole[] = [
  "consumer",
  "energy_sales",
];
const RESPOND_ON_BUY_ENERGY: ParticipantRole[] = [
  "producer_wholesale",
  "producer_retail",
  "energy_sales",
];
const RESPOND_ON_SELL_CAPACITY: ParticipantRole[] = [
  "consumer",
  "energy_sales",
];
const RESPOND_ON_BUY_CAPACITY: ParticipantRole[] = [
  "producer_wholesale",
  "producer_retail",
];
const RESPOND_ON_SELL_SERVICE: ParticipantRole[] = [
  "consumer",
  "producer_wholesale",
  "producer_retail",
  "energy_sales",
];
const RESPOND_ON_BUY_SERVICE: ParticipantRole[] = [
  "demand_aggregator",
  "service_provider",
];

function matrixKey(
  category: CommodityCategory,
  direction: Direction,
): MatrixKey {
  return `${category}_${direction}`;
}

/** Проверка права создания предложения (§3.2) */
export function canCreateOffer(
  role: ParticipantRole,
  category: CommodityCategory,
  direction: Direction,
): boolean {
  if (role === "operator" || role === "admin") return false;
  const allowed = CREATE_MATRIX[role];
  if (!allowed) return false;
  return allowed.includes(matrixKey(category, direction));
}

/** Проверка права отклика на предложение (§3.2) */
export function canRespond(
  role: ParticipantRole,
  offerCategory: CommodityCategory,
  offerDirection: Direction,
): boolean {
  if (role === "operator" || role === "admin") return false;

  if (offerCategory === "energy") {
    return offerDirection === "sell"
      ? RESPOND_ON_SELL_ENERGY.includes(role)
      : RESPOND_ON_BUY_ENERGY.includes(role);
  }
  if (offerCategory === "capacity") {
    return offerDirection === "sell"
      ? RESPOND_ON_SELL_CAPACITY.includes(role)
      : RESPOND_ON_BUY_CAPACITY.includes(role);
  }
  return offerDirection === "sell"
    ? RESPOND_ON_SELL_SERVICE.includes(role)
    : RESPOND_ON_BUY_SERVICE.includes(role);
}

/** Доступные типы предложений для роли */
export function getAvailableOfferTypes(
  role: ParticipantRole,
): Array<{ category: CommodityCategory; direction: Direction }> {
  const keys = CREATE_MATRIX[role] ?? [];
  return keys.map((k) => {
    const [category, direction] = k.split("_") as [
      CommodityCategory,
      Direction,
    ];
    return { category, direction };
  });
}
