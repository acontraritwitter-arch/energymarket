"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Tooltip } from "@/components/ui/Tooltip";
import { useApp } from "@/contexts/AppContext";
import { useCurrentUser } from "@/hooks";
import {
  AGREEMENT_GP_BANNER,
  CONTRACT_BUTTON_TOOLTIP,
} from "@/lib/constants";
import { OPERATOR_CONTACTS } from "@/lib/mock-data";
import type { CommodityCategory } from "@/lib/types";
import {
  formatDateRu,
  formatPrice,
} from "@/lib/utils";

export default function AgreementsPage() {
  const { agreements, organizations } = useApp();
  const { organization } = useCurrentUser();
  const [tab, setTab] = useState<"all" | CommodityCategory>("all");

  const list = useMemo(() => {
    let items = agreements.filter(
      (a) => a.seller_id === organization.id || a.buyer_id === organization.id,
    );
    if (tab !== "all") {
      items = items.filter((a) => a.commodity_category === tab);
    }
    return items.sort(
      (a, b) => new Date(b.agreed_at).getTime() - new Date(a.agreed_at).getTime(),
    );
  }, [agreements, organization.id, tab]);

  const tabs = [
    { id: "all", label: "Все" },
    { id: "energy", label: "⚡ ЭЭ" },
    { id: "capacity", label: "🔋 Мощность" },
    { id: "service", label: "🔧 Услуги" },
  ];

  return (
    <PageWrapper title="Достигнутые согласия">
      <div className="mb-6 rounded-lg border border-cap/30 bg-cap-faint/40 p-4 text-sm text-ink-600">
        <p>{AGREEMENT_GP_BANNER}</p>
        <p className="mt-2">
          {OPERATOR_CONTACTS.organization_name}: {OPERATOR_CONTACTS.phone},{" "}
          {OPERATOR_CONTACTS.email}
        </p>
      </div>

      <Tabs
        tabs={tabs}
        active={tab}
        onChange={(id) => setTab(id as typeof tab)}
      />

      <div className="mt-6 overflow-x-auto rounded-xl border border-surface-border">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-surface-border bg-surface-2 text-xs text-ink-400">
            <tr>
              <th className="px-4 py-3">Номер</th>
              <th className="px-4 py-3">Категория</th>
              <th className="px-4 py-3">Контрагент</th>
              <th className="px-4 py-3">Цена</th>
              <th className="px-4 py-3">Дата согласия</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {list.map((agr) => {
              const counterId =
                agr.seller_id === organization.id ? agr.buyer_id : agr.seller_id;
              const counter = organizations.find((o) => o.id === counterId);
              const price =
                agr.commodity_category === "energy"
                  ? formatPrice(agr.final_price, "energy")
                  : agr.commodity_category === "capacity"
                    ? formatPrice(agr.final_capacity_price, "capacity")
                    : agr.final_service_price;
              return (
                <tr
                  key={agr.id}
                  className="border-b border-surface-border last:border-0"
                >
                  <td className="px-4 py-3 font-mono text-xs">{agr.id}</td>
                  <td className="px-4 py-3">
                    <CategoryBadge category={agr.commodity_category} size="sm" />
                  </td>
                  <td className="px-4 py-3">{counter?.name}</td>
                  <td className="px-4 py-3 font-mono">{price}</td>
                  <td className="px-4 py-3">{formatDateRu(agr.agreed_at)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/agreements/${agr.id}`}
                      className="text-energy hover:underline"
                    >
                      Открыть
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {list.length === 0 && (
        <p className="mt-6 text-center text-sm text-ink-400">
          Согласий пока нет
        </p>
      )}

      <div className="mt-8">
        <Tooltip content={CONTRACT_BUTTON_TOOLTIP}>
          <Button disabled>Оформить договор</Button>
        </Tooltip>
      </div>
    </PageWrapper>
  );
}
