import type {
  CommodityCategory,
  DeliveryProfile,
  GenerationType,
  ParticipantRole,
  PilotRegion,
  PriceCategory,
  ResponseStatus,
  OfferStatus,
  ServiceCategory,
  NotificationType,
} from "./types";

export const APP_NAME = "Торговая площадка электрической энергии и мощности";

export const PILOT_PP_REFERENCE =
  "Постановление Правительства РФ от 31.01.2026 № 77";

export const PILOT_START_DATE = "2026-02-01";

export const ROLE_IDS: Record<ParticipantRole, string> = {
  operator: "R01",
  consumer: "R02",
  producer_wholesale: "R03",
  producer_retail: "R04",
  energy_sales: "R05",
  demand_aggregator: "R06",
  service_provider: "R07",
  admin: "R08",
};

export const PARTICIPANT_ROLES: ParticipantRole[] = [
  "consumer",
  "producer_wholesale",
  "producer_retail",
  "energy_sales",
  "demand_aggregator",
  "service_provider",
];

export const ROLE_LABELS: Record<ParticipantRole, string> = {
  consumer: "Потребитель",
  producer_wholesale: "Производитель (оптовый рынок)",
  producer_retail: "Производитель (розничный рынок)",
  energy_sales: "Энергосбытовая организация",
  demand_aggregator: "Агрегатор управления спросом",
  service_provider: "Поставщик услуг",
  operator: "Оператор площадки",
  admin: "Администратор системы",
};

export const ROLE_SHORT_LABELS: Record<ParticipantRole, string> = {
  consumer: "Потребитель",
  producer_wholesale: "Производитель (ОРЭМ)",
  producer_retail: "Производитель (розница)",
  energy_sales: "Энергосбыт",
  demand_aggregator: "Агрегатор спроса",
  service_provider: "Поставщик услуг",
  operator: "Оператор",
  admin: "Администратор",
};

export const ROLE_DESCRIPTIONS: Record<
  Exclude<ParticipantRole, "operator" | "admin">,
  string
> = {
  consumer:
    "Покупатель электрической энергии и мощности (ценовые категории 3–6)",
  producer_wholesale:
    "Субъект оптового рынка — производитель электрической энергии и мощности",
  producer_retail:
    "Производитель на розничном рынке, в том числе ВИЭ и малая генерация",
  energy_sales: "Иной поставщик электрической энергии на розничном рынке",
  demand_aggregator:
    "Агрегатор управления изменением режима потребления электрической энергии",
  service_provider:
    "Поставщик сопутствующих услуг в сфере энергоснабжения",
};

export const PILOT_REGIONS: PilotRegion[] = [
  "moscow_region",
  "nizhny_novgorod",
  "samara",
  "sverdlovsk",
  "krasnoyarsk",
  "novosibirsk",
  "primorsky",
];

export const REGION_LABELS: Record<PilotRegion, string> = {
  moscow_region: "Московская область",
  nizhny_novgorod: "Нижегородская область",
  samara: "Самарская область",
  sverdlovsk: "Свердловская область",
  krasnoyarsk: "Красноярский край",
  novosibirsk: "Новосибирская область",
  primorsky: "Приморский край",
};

export const CATEGORY_LABELS: Record<CommodityCategory, string> = {
  energy: "Электрическая энергия",
  capacity: "Мощность",
  service: "Сопутствующие услуги",
};

export const CATEGORY_ICONS: Record<CommodityCategory, string> = {
  energy: "⚡",
  capacity: "🔋",
  service: "🔧",
};

export const DIRECTION_LABELS: Record<"sell" | "buy", string> = {
  sell: "Продажа",
  buy: "Покупка",
};

export const PRICE_CATEGORY_OPTIONS: PriceCategory[] = ["3", "4", "5", "6"];

export const GENERATION_LABELS: Record<GenerationType, string> = {
  tes_gas: "ТЭС (газ)",
  tes_coal: "ТЭС (уголь)",
  hes: "ГЭС",
  aes: "АЭС",
  vie_wind: "ВИЭ (ветровая)",
  vie_solar: "ВИЭ (солнечная)",
  other: "Иное",
};

export const DELIVERY_PROFILE_LABELS: Record<DeliveryProfile, string> = {
  base: "Базовая",
  peak: "Пиковая",
  offpeak: "Внепиковая",
  custom: "Произвольный",
};

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  demand_response: "Управление спросом",
  energy_saving: "Энергосбережение",
  energy_audit: "Энергоаудит",
  green_attributes: "Атрибуты генерации",
  capacity_redistribution: "Перераспределение мощности",
  other: "Иное",
};

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  draft: "Черновик",
  active: "Активное",
  in_negotiation: "В переговорах",
  agreed: "Согласие достигнуто",
  withdrawn: "Отозвано",
  expired: "Срок истёк",
  negotiations_terminated: "Переговоры прекращены",
};

export const RESPONSE_STATUS_LABELS: Record<ResponseStatus, string> = {
  sent: "Отправлен",
  counter_received: "Контрпредложение получено",
  agreed: "Принципиальное согласие",
  rejected: "Отклонён",
  withdrawn: "Отозван",
  terminated: "Переговоры прекращены",
};

export const PRICE_TYPE_LABELS: Record<
  import("./types").PriceType,
  string
> = {
  fixed: "Фиксированная",
  indexed: "Индексируемая",
  zonal: "Зонная",
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  N01: "Новая заявка на присоединение",
  N02: "Заявка одобрена/отклонена",
  N03: "Новое предложение по профилю",
  N04: "Новый отклик на предложение",
  N05: "Контрпредложение получено",
  N06: "Контрпредложение от инициатора",
  N07: "Принципиальное согласие достигнуто",
  N08: "Отклик отклонён",
  N09: "Предложение отозвано",
  N10: "Срок действия истекает",
  N11: "Новое сообщение в чате",
  N12: "Ожидание ответа",
};

export const NAV_PARTICIPANT = [
  { href: "/dashboard", label: "Главная", icon: "home" },
  { href: "/catalog", label: "Каталог", icon: "search", badge: "catalog" },
  { href: "/offers", label: "Мои предложения", icon: "file" },
  {
    href: "/negotiations",
    label: "Переговоры",
    icon: "handshake",
    badge: "turn",
  },
  { href: "/agreements", label: "Согласия", icon: "check" },
  { href: "/market-prices", label: "Справка ОРЭМ", icon: "chart" },
  {
    href: "/notifications",
    label: "Уведомления",
    icon: "bell",
    badge: "notifications",
  },
  { href: "/profile", label: "Профиль", icon: "settings" },
] as const;

export const NAV_OPERATOR = [
  { href: "/op-dashboard", label: "Дашборд", icon: "chart" },
  {
    href: "/op-participants",
    label: "Участники",
    icon: "users",
    badge: "applications",
  },
  { href: "/op-monitoring", label: "Мониторинг", icon: "clipboard" },
] as const;

export const AGREEMENT_GP_BANNER =
  "Для заключения договора обратитесь к гарантирующему поставщику";

export const MARKET_PRICES_FUTURE_NOTE =
  "В будущих версиях данные будут поступать автоматически из АО «АТС»";

export const CONTRACT_BUTTON_TOOLTIP =
  "Функция будет доступна в следующей версии платформы";

export const COMMENT_MAX_LENGTH = 2000;

export const OFFER_PERIOD_END_MAX = "2027-12-31";

export const OFFER_PERIOD_START_MIN_DAYS = 30;

export const cardEntrance = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: "easeOut" as const },
};

export const pageEntrance = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.18 },
};
