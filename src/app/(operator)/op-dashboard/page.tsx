"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { DashboardWidget } from "@/components/domain/DashboardWidget";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/contexts/AppContext";
import {
  CATEGORY_LABELS,
  PILOT_REGIONS,
  REGION_LABELS,
} from "@/lib/constants";
import type { CommodityCategory, PilotRegion } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<CommodityCategory, string> = {
  energy: "#2563eb",
  capacity: "#7c3aed",
  service: "#059669",
};

function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;
  const r = 42;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <svg viewBox="0 0 100 100" className="h-36 w-36 shrink-0" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#e8ecf1"
          strokeWidth="14"
        />
        {segments.map((seg) => {
          const len = (seg.value / total) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <circle
              key={seg.label}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="14"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform="rotate(-90 50 50)"
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
        <text
          x="50"
          y="48"
          textAnchor="middle"
          className="fill-ink text-[11px] font-semibold"
          style={{ fontSize: 11 }}
        >
          {total}
        </text>
        <text
          x="50"
          y="58"
          textAnchor="middle"
          className="fill-ink-400"
          style={{ fontSize: 7 }}
        >
          всего
        </text>
      </svg>
      <ul className="flex flex-1 flex-col gap-2 text-sm">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-ink-600">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              {seg.label}
            </span>
            <span className="font-mono font-medium text-ink">
              {seg.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RegionBarChart({
  data,
}: {
  data: { region: PilotRegion; count: number }[];
}) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <svg
      viewBox={`0 0 320 ${data.length * 28 + 8}`}
      className="w-full max-h-64"
      role="img"
      aria-label="Распределение участников по регионам"
    >
      {data.map((d, i) => {
        const w = (d.count / max) * 220;
        const y = 8 + i * 28;
        return (
          <g key={d.region}>
            <text x="0" y={y + 14} className="fill-ink-500 text-[9px]">
              {REGION_LABELS[d.region].replace(" область", "").replace(" край", "")}
            </text>
            <rect
              x="100"
              y={y + 4}
              width={w}
              height="16"
              rx="4"
              className="fill-energy/80"
            />
            <text x={106 + w} y={y + 16} className="fill-ink text-[9px] font-mono">
              {d.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** FR-OP-001: дашборд оператора */
export default function OpDashboardPage() {
  const {
    organizations,
    registrationApplications,
    offers,
    negotiations,
    agreements,
    notifications,
    currentUser,
  } = useApp();

  const stats = useMemo(() => {
    const participants = organizations.filter(
      (o) => o.status === "active" && o.type !== "operator",
    );
    const pendingApps = registrationApplications.filter(
      (a) => a.status === "pending_review",
    );
    const activeOffers = offers.filter(
      (o) =>
        (o.status === "active" || o.status === "in_negotiation") &&
        !o.hidden_by_operator,
    );
    const byCat = (cat: CommodityCategory) =>
      activeOffers.filter((o) => o.commodity_category === cat).length;
    const activeNegotiations = negotiations.filter((r) =>
      ["sent", "counter_received"].includes(r.status),
    );
    const agreementsByCat = {
      energy: agreements.filter((a) => a.commodity_category === "energy").length,
      capacity: agreements.filter((a) => a.commodity_category === "capacity")
        .length,
      service: agreements.filter((a) => a.commodity_category === "service")
        .length,
    };
    const regionCounts = PILOT_REGIONS.map((region) => ({
      region,
      count: participants.filter((o) => o.region === region).length,
    }));
    const categorySegments = (
      ["energy", "capacity", "service"] as CommodityCategory[]
    ).map((cat) => ({
      label: CATEGORY_LABELS[cat],
      value: byCat(cat),
      color: CATEGORY_COLORS[cat],
    }));
    const hiddenOffers = offers.filter((o) => o.hidden_by_operator).length;
    const operatorUnread = notifications.filter(
      (n) => n.user_id === currentUser.id && !n.is_read,
    ).length;

    return {
      participants: participants.length,
      pendingApps: pendingApps.length,
      ee: byCat("energy"),
      cap: byCat("capacity"),
      svc: byCat("service"),
      negotiations: activeNegotiations.length,
      agreementsTotal: agreements.length,
      agreementsByCat,
      regionCounts,
      categorySegments,
      hiddenOffers,
      operatorUnread,
      infoRequested: registrationApplications.filter(
        (a) => a.status === "info_requested",
      ).length,
    };
  }, [
    organizations,
    registrationApplications,
    offers,
    negotiations,
    agreements,
    notifications,
    currentUser.id,
  ]);

  const attentionItems = useMemo(() => {
    const items: { text: string; href: string; tone: "warn" | "info" }[] = [];
    if (stats.pendingApps > 0) {
      items.push({
        text: `${stats.pendingApps} заявок ожидают рассмотрения`,
        href: "/op-participants",
        tone: "warn",
      });
    }
    if (stats.infoRequested > 0) {
      items.push({
        text: `${stats.infoRequested} заявок — запрошена дополнительная информация`,
        href: "/op-participants",
        tone: "info",
      });
    }
    if (stats.hiddenOffers > 0) {
      items.push({
        text: `${stats.hiddenOffers} предложений скрыто модерацией`,
        href: "/op-monitoring",
        tone: "info",
      });
    }
    if (stats.operatorUnread > 0) {
      items.push({
        text: `${stats.operatorUnread} непрочитанных уведомлений`,
        href: "/notifications",
        tone: "info",
      });
    }
    return items;
  }, [stats]);

  return (
    <PageWrapper title="Дашборд оператора">
      {attentionItems.length > 0 && (
        <Card className="mb-6 border-warning/30 bg-warning/5 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
            <div>
              <p className="font-semibold text-ink">Требует внимания</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {attentionItems.map((item) => (
                  <li key={item.text}>
                    <Link
                      href={item.href}
                      className={cn(
                        "underline-offset-2 hover:underline",
                        item.tone === "warn"
                          ? "text-amber-900"
                          : "text-ink-600",
                      )}
                    >
                      {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardWidget
          title="Всего участников"
          value={stats.participants}
          subtitle="активные организации"
        />
        <DashboardWidget
          title="Новые заявки"
          value={stats.pendingApps}
          href="/op-participants"
          subtitle="ожидают рассмотрения"
        />
        <DashboardWidget
          title="Переговоры"
          value={stats.negotiations}
          href="/op-monitoring"
          subtitle="активные цепочки"
        />
        <DashboardWidget
          title="Достигнутые согласия"
          value={stats.agreementsTotal}
          subtitle={`ЭЭ: ${stats.agreementsByCat.energy}, мощность: ${stats.agreementsByCat.capacity}, услуги: ${stats.agreementsByCat.service}`}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <DashboardWidget title="Активные предложения (ЭЭ)" value={stats.ee} />
        <DashboardWidget
          title="Активные предложения (мощность)"
          value={stats.cap}
        />
        <DashboardWidget
          title="Активные предложения (услуги)"
          value={stats.svc}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">
            Распределение по категориям предложений
          </h2>
          <DonutChart segments={stats.categorySegments} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">
            Распределение участников по регионам
          </h2>
          <RegionBarChart data={stats.regionCounts} />
        </Card>
      </div>
    </PageWrapper>
  );
}
