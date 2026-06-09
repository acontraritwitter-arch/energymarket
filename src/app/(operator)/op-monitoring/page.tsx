"use client";

import { useMemo, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { AgreementCard } from "@/components/domain/AgreementCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { CategoryBadge, DirectionBadge } from "@/components/ui/CategoryBadge";
import { useApp } from "@/contexts/AppContext";
import { createNotification } from "@/lib/app-actions";
import {
  CATEGORY_LABELS,
  DIRECTION_LABELS,
  PARTICIPANT_ROLES,
  PILOT_PP_REFERENCE,
  PILOT_REGIONS,
  PILOT_START_DATE,
  REGION_LABELS,
  ROLE_SHORT_LABELS,
  SERVICE_CATEGORY_LABELS,
} from "@/lib/constants";
import type {
  CommodityCategory,
  Offer,
  OfferResponse,
  PilotRegion,
} from "@/lib/types";
import {
  formatDateRu,
  formatNumber,
  formatPrice,
  getOfferDisplayPrice,
  regionLabel,
} from "@/lib/utils";

type TabId = "offers" | "negotiations" | "agreements" | "reports";

type PeriodPreset = "pilot" | "month" | "quarter" | "custom";

function inPeriod(
  iso: string,
  from: Date,
  to: Date,
): boolean {
  const d = new Date(iso);
  return d >= from && d <= to;
}

function periodBounds(
  preset: PeriodPreset,
  customFrom: string,
  customTo: string,
): { from: Date; to: Date; label: string } {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  if (preset === "pilot") {
    return {
      from: new Date(`${PILOT_START_DATE}T00:00:00`),
      to,
      label: `с ${formatDateRu(PILOT_START_DATE)}`,
    };
  }
  if (preset === "month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from, to, label: "текущий месяц" };
  }
  if (preset === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    const from = new Date(now.getFullYear(), q * 3, 1);
    return { from, to, label: "текущий квартал" };
  }
  const from = customFrom
    ? new Date(`${customFrom}T00:00:00`)
    : new Date(`${PILOT_START_DATE}T00:00:00`);
  const customEnd = customTo
    ? new Date(`${customTo}T23:59:59`)
    : to;
  return {
    from,
    to: customEnd,
    label: `${formatDateRu(from.toISOString())} — ${formatDateRu(customEnd.toISOString())}`,
  };
}

/** FR-OP-003 / FR-OP-004: мониторинг и отчётность */
export default function OpMonitoringPage() {
  const {
    dispatch,
    offers,
    negotiations,
    agreements,
    organizations,
    users,
    iterations,
    currentUser,
  } = useApp();

  const [tab, setTab] = useState<TabId>("offers");
  const [category, setCategory] = useState<string>("all");
  const [direction, setDirection] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [region, setRegion] = useState<string>("all");
  const [authorSearch, setAuthorSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [detailOffer, setDetailOffer] = useState<Offer | null>(null);
  const [hideOffer, setHideOffer] = useState<Offer | null>(null);
  const [hideReason, setHideReason] = useState("");
  const [detailResponse, setDetailResponse] = useState<OfferResponse | null>(
    null,
  );

  const [reportPreset, setReportPreset] = useState<PeriodPreset>("pilot");
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");

  const orgById = useMemo(
    () => new Map(organizations.map((o) => [o.id, o])),
    [organizations],
  );

  const authorMatches = (orgId: string) => {
    const q = authorSearch.trim().toLowerCase();
    if (!q) return true;
    const org = orgById.get(orgId);
    if (!org) return false;
    return (
      org.name.toLowerCase().includes(q) || org.inn.includes(q.replace(/\s/g, ""))
    );
  };

  const offerInDateRange = (offer: Offer) => {
    if (!dateFrom && !dateTo) return true;
    const ref = offer.published_at ?? offer.created_at;
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : new Date(0);
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : new Date(8640000000000000);
    const d = new Date(ref);
    return d >= from && d <= to;
  };

  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      if (category !== "all" && o.commodity_category !== category) return false;
      if (direction !== "all" && o.direction !== direction) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (
        region !== "all" &&
        !o.region.includes(region as PilotRegion)
      ) {
        return false;
      }
      if (!authorMatches(o.organization_id)) return false;
      if (!offerInDateRange(o)) return false;
      return true;
    });
  }, [
    offers,
    category,
    direction,
    statusFilter,
    region,
    authorSearch,
    dateFrom,
    dateTo,
    orgById,
  ]);

  const filteredNegotiations = useMemo(() => {
    return negotiations.filter((r) => {
      const offer = offers.find((o) => o.id === r.offer_id);
      if (!offer) return false;
      if (category !== "all" && offer.commodity_category !== category)
        return false;
      if (direction !== "all" && offer.direction !== direction) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (
        region !== "all" &&
        !offer.region.includes(region as PilotRegion)
      ) {
        return false;
      }
      if (authorSearch.trim()) {
        if (
          !authorMatches(offer.organization_id) &&
          !authorMatches(r.respondent_organization_id)
        ) {
          return false;
        }
      }
      if (dateFrom || dateTo) {
        const from = dateFrom
          ? new Date(`${dateFrom}T00:00:00`)
          : new Date(0);
        const to = dateTo
          ? new Date(`${dateTo}T23:59:59`)
          : new Date(8640000000000000);
        const d = new Date(r.created_at);
        if (d < from || d > to) return false;
      }
      return true;
    });
  }, [
    negotiations,
    offers,
    category,
    direction,
    statusFilter,
    region,
    authorSearch,
    dateFrom,
    dateTo,
    orgById,
  ]);

  const filteredAgreements = useMemo(() => {
    return agreements.filter((a) => {
      if (category !== "all" && a.commodity_category !== category) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!authorMatches(a.seller_id) && !authorMatches(a.buyer_id)) {
        if (authorSearch.trim()) return false;
      }
      if (dateFrom || dateTo) {
        const from = dateFrom
          ? new Date(`${dateFrom}T00:00:00`)
          : new Date(0);
        const to = dateTo
          ? new Date(`${dateTo}T23:59:59`)
          : new Date(8640000000000000);
        const d = new Date(a.agreed_at);
        if (d < from || d > to) return false;
      }
      return true;
    });
  }, [
    agreements,
    category,
    statusFilter,
    authorSearch,
    dateFrom,
    dateTo,
    orgById,
  ]);

  const report = useMemo(() => {
    const { from, to, label } = periodBounds(
      reportPreset,
      reportFrom,
      reportTo,
    );
    const activeOrgs = organizations.filter(
      (o) => o.status === "active" && o.type !== "operator",
    );
    const byRole = PARTICIPANT_ROLES.map((role) => ({
      role,
      count: activeOrgs.filter((o) => o.type === role).length,
    }));
    const periodAgreements = agreements.filter(
      (a) =>
        a.status === "agreed" && inPeriod(a.agreed_at, from, to),
    );
    const dealsByCat = (["energy", "capacity", "service"] as CommodityCategory[]).map(
      (cat) => ({
        cat,
        count: periodAgreements.filter((a) => a.commodity_category === cat)
          .length,
      }),
    );
    const serviceAgreements = periodAgreements.filter(
      (a) => a.commodity_category === "service",
    );
    const serviceVolume = serviceAgreements.reduce(
      (sum, a) => sum + (a.final_service_price_numeric ?? 0),
      0,
    );
    const serviceByCategory = Object.entries(SERVICE_CATEGORY_LABELS).map(
      ([key, labelSvc]) => ({
        key,
        label: labelSvc,
        count: serviceAgreements.filter((a) => a.service_category === key)
          .length,
      }),
    );

    return {
      periodLabel: label,
      indicator1: {
        orgs: activeOrgs.length,
        citizens: 0,
        byRole,
      },
      indicator2: {
        total: periodAgreements.length,
        byCat: dealsByCat,
        note:
          "Под сделкой понимается достигнутое на торговой площадке принципиальное согласие между сторонами по существенным условиям.",
      },
      indicator3: {
        count: serviceAgreements.length,
        volume: serviceVolume,
        byCategory: serviceByCategory,
      },
    };
  }, [
    organizations,
    agreements,
    reportPreset,
    reportFrom,
    reportTo,
  ]);

  const hideOfferConfirm = () => {
    if (!hideOffer || !hideReason.trim()) return;
    const author = users.find((u) => u.id === hideOffer.author_id);
    dispatch({
      type: "UPDATE_OFFER",
      offer: { ...hideOffer, hidden_by_operator: true },
    });
    if (author) {
      dispatch({
        type: "ADD_NOTIFICATION",
        notification: createNotification({
          user_id: author.id,
          type: "N09",
          title: "Предложение скрыто оператором",
          body: hideReason.trim(),
          related_entity_type: "offer",
          related_entity_id: hideOffer.id,
          is_read: false,
          channel: "system_email",
          category_filter: "offers",
        }),
      });
    }
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: createNotification({
        user_id: currentUser.id,
        type: "N09",
        title: "Модерация предложения",
        body: `Скрыто «${hideOffer.id}»: ${hideReason.trim()}`,
        related_entity_type: "offer",
        related_entity_id: hideOffer.id,
        is_read: true,
        channel: "system",
        category_filter: "system",
      }),
    });
    setHideOffer(null);
    setHideReason("");
    setDetailOffer(null);
  };

  const downloadReport = () => {
    const lines = [
      "Индикативные показатели пилотного проекта",
      PILOT_PP_REFERENCE,
      `Период: ${report.periodLabel}`,
      "",
      "Показатель 1. Участники",
      `Организации (активные): ${report.indicator1.orgs}`,
      "Граждане: 0 (не применимо в рамках текущей конфигурации)",
      ...report.indicator1.byRole.map(
        (r) => `${ROLE_SHORT_LABELS[r.role]}: ${r.count}`,
      ),
      "",
      "Показатель 2. Сделки (принципиальные согласия)",
      `Всего: ${report.indicator2.total}`,
      ...report.indicator2.byCat.map(
        (d) => `${CATEGORY_LABELS[d.cat]}: ${d.count}`,
      ),
      "",
      "Показатель 3. Услуги",
      `Количество: ${report.indicator3.count}`,
      `Объём (числовые цены), ₽: ${report.indicator3.volume}`,
    ];
    const blob = new Blob(["\uFEFF" + lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "indikatory-pilota.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusOptions =
    tab === "negotiations"
      ? [
          { value: "all", label: "Все статусы" },
          { value: "sent", label: "Отправлен" },
          { value: "counter_received", label: "Контрпредложение" },
          { value: "agreed", label: "Согласие" },
          { value: "rejected", label: "Отклонён" },
          { value: "terminated", label: "Прекращены" },
        ]
      : tab === "agreements"
        ? [
            { value: "all", label: "Все статусы" },
            { value: "agreed", label: "Согласие достигнуто" },
            { value: "contract_pending", label: "Ожидает договор" },
          ]
        : [
            { value: "all", label: "Все статусы" },
            { value: "active", label: "Активное" },
            { value: "in_negotiation", label: "В переговорах" },
            { value: "agreed", label: "Согласие" },
            { value: "withdrawn", label: "Отозвано" },
            { value: "expired", label: "Истёк срок" },
          ];

  return (
    <PageWrapper title="Мониторинг">
      <Tabs
        active={tab}
        onChange={(id) => {
          setTab(id as TabId);
          setStatusFilter("all");
        }}
        tabs={[
          { id: "offers", label: "Предложения" },
          { id: "negotiations", label: "Переговоры" },
          { id: "agreements", label: "Согласия" },
          { id: "reports", label: "Отчётность" },
        ]}
        className="mb-6"
      />

      {tab !== "reports" && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Select
            label="Категория"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: "all", label: "Все" },
              { value: "energy", label: "ЭЭ" },
              { value: "capacity", label: "Мощность" },
              { value: "service", label: "Услуги" },
            ]}
          />
          {(tab === "offers" || tab === "negotiations") && (
            <Select
              label="Направление"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              options={[
                { value: "all", label: "Все" },
                { value: "sell", label: "Продажа" },
                { value: "buy", label: "Покупка" },
              ]}
            />
          )}
          <Select
            label="Статус"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
          <Select
            label="Регион"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            options={[
              { value: "all", label: "Все регионы" },
              ...PILOT_REGIONS.map((r) => ({
                value: r,
                label: REGION_LABELS[r],
              })),
            ]}
          />
          <Input
            label="Автор"
            placeholder="Наименование или ИНН"
            value={authorSearch}
            onChange={(e) => setAuthorSearch(e.target.value)}
          />
          <Input
            label="Период с"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            label="Период по"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      )}

      {tab === "offers" && (
        <div className="space-y-3">
          {filteredOffers.map((offer) => {
            const org = orgById.get(offer.organization_id);
            const price = getOfferDisplayPrice(offer);
            return (
              <Card key={offer.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <CategoryBadge category={offer.commodity_category} size="sm" />
                      <DirectionBadge direction={offer.direction} />
                      <StatusBadge status={offer.status} kind="offer" />
                      {offer.hidden_by_operator && (
                        <span className="text-xs text-error">Скрыто</span>
                      )}
                    </div>
                    <p className="font-medium text-ink">{org?.name ?? "—"}</p>
                    <p className="mt-1 font-mono text-lg text-ink">
                      {formatPrice(price.value, offer.commodity_category, {
                        text: price.text,
                      })}
                    </p>
                    <p className="mt-1 text-xs text-ink-400">
                      {offer.region.map(regionLabel).join(", ")} · опубликовано{" "}
                      {formatDateRu(offer.published_at ?? offer.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setDetailOffer(offer)}
                    >
                      Детали
                    </Button>
                    {!offer.hidden_by_operator && offer.status === "active" && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setHideOffer(offer);
                          setHideReason("");
                        }}
                      >
                        Скрыть
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
          {filteredOffers.length === 0 && (
            <p className="text-sm text-ink-400">Предложения не найдены</p>
          )}
        </div>
      )}

      {tab === "negotiations" && (
        <div className="space-y-3">
          {filteredNegotiations.map((r) => {
            const offer = offers.find((o) => o.id === r.offer_id)!;
            const initiator = orgById.get(offer.organization_id);
            const respondent = orgById.get(r.respondent_organization_id);
            const iterCount = iterations.filter(
              (i) => i.response_id === r.id,
            ).length;
            return (
              <Card key={r.id} className="p-4">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <CategoryBadge
                        category={offer.commodity_category}
                        size="sm"
                      />
                      <StatusBadge status={r.status} kind="response" />
                    </div>
                    <p className="text-sm text-ink">
                      {initiator?.name} → {respondent?.name}
                    </p>
                    <p className="mt-1 text-xs text-ink-400">
                      Итераций: {iterCount} ·{" "}
                      {formatDateRu(r.last_action_at ?? r.created_at)}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setDetailResponse(r)}
                  >
                    Детали
                  </Button>
                </div>
              </Card>
            );
          })}
          {filteredNegotiations.length === 0 && (
            <p className="text-sm text-ink-400">Переговоры не найдены</p>
          )}
        </div>
      )}

      {tab === "agreements" && (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredAgreements.map((a) => (
            <AgreementCard key={a.id} agreement={a} />
          ))}
          {filteredAgreements.length === 0 && (
            <p className="text-sm text-ink-400">Согласия не найдены</p>
          )}
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex flex-wrap items-end gap-3">
              <Select
                label="Период отчёта"
                value={reportPreset}
                onChange={(e) =>
                  setReportPreset(e.target.value as PeriodPreset)
                }
                options={[
                  {
                    value: "pilot",
                    label: "С начала пилота (01.02.2026)",
                  },
                  { value: "month", label: "Текущий месяц" },
                  { value: "quarter", label: "Текущий квартал" },
                  { value: "custom", label: "Произвольный диапазон" },
                ]}
              />
              {reportPreset === "custom" && (
                <>
                  <Input
                    label="С"
                    type="date"
                    value={reportFrom}
                    onChange={(e) => setReportFrom(e.target.value)}
                  />
                  <Input
                    label="По"
                    type="date"
                    value={reportTo}
                    onChange={(e) => setReportTo(e.target.value)}
                  />
                </>
              )}
              <Button onClick={downloadReport}>Выгрузить XLSX</Button>
            </div>
            <p className="mt-3 text-xs text-ink-400">
              Отчёт «Индикативные показатели пилотного проекта» · период:{" "}
              {report.periodLabel}
            </p>
          </Card>

          <ReportIndicator
            title="Показатель 1. Участники пилотного проекта"
            description="Количество организаций со статусом «Активный», прошедших одобрение оператора."
          >
            <p className="font-mono text-3xl font-bold text-ink">
              {report.indicator1.orgs}
            </p>
            <p className="mt-2 text-sm text-ink-500">
              Граждане:{" "}
              <span className="font-mono">0</span> — не применимо в рамках
              текущей конфигурации
            </p>
            <ul className="mt-4 space-y-1 text-sm">
              {report.indicator1.byRole.map((row) => (
                <li
                  key={row.role}
                  className="flex justify-between border-b border-surface-border py-1"
                >
                  <span>{ROLE_SHORT_LABELS[row.role]}</span>
                  <span className="font-mono">{row.count}</span>
                </li>
              ))}
            </ul>
          </ReportIndicator>

          <ReportIndicator
            title="Показатель 2. Сделки на торговой площадке"
            description={report.indicator2.note}
          >
            <p className="font-mono text-3xl font-bold text-ink">
              {report.indicator2.total}
            </p>
            <ul className="mt-4 space-y-1 text-sm">
              {report.indicator2.byCat.map((row) => (
                <li
                  key={row.cat}
                  className="flex justify-between border-b border-surface-border py-1"
                >
                  <span>{CATEGORY_LABELS[row.cat]}</span>
                  <span className="font-mono">{row.count}</span>
                </li>
              ))}
            </ul>
          </ReportIndicator>

          <ReportIndicator
            title="Показатель 3. Реализованные работы и услуги"
            description="Согласия по категории «Сопутствующие услуги» за выбранный период."
          >
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-xs text-ink-400">Количество</p>
                <p className="font-mono text-3xl font-bold text-ink">
                  {report.indicator3.count}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Объём (числовые цены)</p>
                <p className="font-mono text-3xl font-bold text-ink">
                  {formatNumber(report.indicator3.volume)}&nbsp;₽
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-1 text-sm">
              {report.indicator3.byCategory.map((row) => (
                <li
                  key={row.key}
                  className="flex justify-between border-b border-surface-border py-1"
                >
                  <span>{row.label}</span>
                  <span className="font-mono">{row.count}</span>
                </li>
              ))}
            </ul>
          </ReportIndicator>
        </div>
      )}

      <Modal
        open={!!detailOffer}
        onClose={() => setDetailOffer(null)}
        title="Предложение (просмотр)"
        footer={
          <Button variant="secondary" onClick={() => setDetailOffer(null)}>
            Закрыть
          </Button>
        }
      >
        {detailOffer && <OfferReadOnly offer={detailOffer} orgById={orgById} />}
      </Modal>

      <Modal
        open={!!detailResponse}
        onClose={() => setDetailResponse(null)}
        title="Переговоры (просмотр)"
        footer={
          <Button variant="secondary" onClick={() => setDetailResponse(null)}>
            Закрыть
          </Button>
        }
      >
        {detailResponse && (
          <NegotiationReadOnly
            response={detailResponse}
            offers={offers}
            orgById={orgById}
            iterations={iterations}
          />
        )}
      </Modal>

      <Modal
        open={!!hideOffer}
        onClose={() => setHideOffer(null)}
        title="Скрыть предложение"
        footer={
          <>
            <Button variant="secondary" onClick={() => setHideOffer(null)}>
              Отмена
            </Button>
            <Button
              variant="danger"
              disabled={!hideReason.trim()}
              onClick={hideOfferConfirm}
            >
              Скрыть и уведомить автора
            </Button>
          </>
        }
      >
        <Input
          label="Причина модерации"
          value={hideReason}
          onChange={(e) => setHideReason(e.target.value)}
          placeholder="Обязательное поле"
        />
      </Modal>
    </PageWrapper>
  );
}

function ReportIndicator({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-ink-400">{description}</p>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function OfferReadOnly({
  offer,
  orgById,
}: {
  offer: Offer;
  orgById: Map<string, import("@/lib/types").Organization>;
}) {
  const org = orgById.get(offer.organization_id);
  const price = getOfferDisplayPrice(offer);
  return (
    <dl className="space-y-2">
      <dt className="text-ink-400">Автор</dt>
      <dd>{org?.name}</dd>
      <dt className="text-ink-400">Категория</dt>
      <dd>{CATEGORY_LABELS[offer.commodity_category]}</dd>
      <dt className="text-ink-400">Направление</dt>
      <dd>{DIRECTION_LABELS[offer.direction]}</dd>
      <dt className="text-ink-400">Цена</dt>
      <dd>
        {formatPrice(price.value, offer.commodity_category, { text: price.text })}
      </dd>
      <dt className="text-ink-400">Регионы</dt>
      <dd>{offer.region.map(regionLabel).join(", ")}</dd>
      {offer.description && (
        <>
          <dt className="text-ink-400">Описание</dt>
          <dd>{offer.description}</dd>
        </>
      )}
    </dl>
  );
}

function NegotiationReadOnly({
  response,
  offers,
  orgById,
  iterations,
}: {
  response: OfferResponse;
  offers: Offer[];
  orgById: Map<string, import("@/lib/types").Organization>;
  iterations: import("@/lib/types").NegotiationIteration[];
}) {
  const offer = offers.find((o) => o.id === response.offer_id);
  if (!offer) return null;
  const iters = iterations.filter((i) => i.response_id === response.id);
  return (
    <div className="space-y-3">
      <p>
        <span className="text-ink-400">Предложение:</span>{" "}
        {CATEGORY_LABELS[offer.commodity_category]},{" "}
        {DIRECTION_LABELS[offer.direction]}
      </p>
      <p>
        <span className="text-ink-400">Инициатор:</span>{" "}
        {orgById.get(offer.organization_id)?.name}
      </p>
      <p>
        <span className="text-ink-400">Откликнувшийся:</span>{" "}
        {orgById.get(response.respondent_organization_id)?.name}
      </p>
      <p>
        <span className="text-ink-400">Статус:</span>{" "}
        <StatusBadge status={response.status} kind="response" />
      </p>
      <p className="text-ink-400">Итерации ({iters.length})</p>
      <ul className="max-h-40 space-y-1 overflow-y-auto text-xs">
        {iters.map((i) => (
          <li key={i.id} className="rounded bg-surface-2 px-2 py-1">
            {i.action} · {formatDateRu(i.created_at)}
          </li>
        ))}
      </ul>
    </div>
  );
}
