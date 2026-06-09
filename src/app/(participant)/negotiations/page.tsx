"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { useApp } from "@/contexts/AppContext";
import { useNegotiationTurn } from "@/hooks";
import { isResponseInitiator } from "@/lib/negotiation";
import type { CommodityCategory, OfferResponse } from "@/lib/types";
import {
  formatDateRu,
  formatPrice,
  formatVolume,
  getOfferDisplayPrice,
  getOfferDisplayVolume,
} from "@/lib/utils";

type GroupTab = "all" | "mine" | "incoming";

function NegotiationListCard({ response }: { response: OfferResponse }) {
  const { offers, organizations, users, iterations, currentUser } = useApp();
  const { isMyTurn, offer: offerFromTurn } = useNegotiationTurn(response);
  const offerData =
    offerFromTurn ?? offers.find((o) => o.id === response.offer_id);
  const lastIter = [...iterations]
    .filter((i) => i.response_id === response.id)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];

  if (!offerData) return null;

  const authorOrg = organizations.find((o) => o.id === offerData.organization_id);
  const respondentOrg = organizations.find(
    (o) => o.id === response.respondent_organization_id,
  );
  const counterparty =
    currentUser.id === offerData.author_id ? respondentOrg : authorOrg;
  const respondent = users.find((u) => u.id === response.respondent_id);

  const priceInfo = getOfferDisplayPrice(offerData);
  const vol =
    lastIter?.volume_energy ??
    lastIter?.volume_capacity ??
    getOfferDisplayVolume(offerData);

  return (
    <Link
      href={`/negotiations/${response.id}`}
      className="block rounded-xl border border-surface-border bg-surface p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-ink">{counterparty?.name}</p>
          <p className="text-xs text-ink-400">{respondent?.full_name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={offerData.commodity_category} size="sm" />
          <StatusBadge status={response.status} kind="response" />
          {isMyTurn ? (
            <span className="rounded-full bg-energy px-2 py-0.5 text-xs font-semibold text-white">
              Ваш ход
            </span>
          ) : (
            <span className="text-xs text-ink-400">Ожидание</span>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-energy">
        {offerData.id} · {offerData.direction === "sell" ? "Продажа" : "Покупка"}
      </p>
      <p className="mt-2 font-mono text-sm text-ink-600">
        {formatPrice(
          lastIter?.price ?? lastIter?.price_capacity ?? priceInfo.value,
          offerData.commodity_category,
          { text: priceInfo.text },
        )}{" "}
        · {formatVolume(vol, offerData.commodity_category)}
      </p>
      <p className="mt-2 text-xs text-ink-400">
        Последнее действие: {formatDateRu(response.last_action_at?.slice(0, 10))}
      </p>
    </Link>
  );
}

export default function NegotiationsPage() {
  const { negotiations, offers, currentUser } = useApp();
  const [group, setGroup] = useState<GroupTab>("all");
  const [category, setCategory] = useState<"all" | CommodityCategory>("all");

  const mine = useMemo(() => {
    return negotiations.filter((r) => {
      const offer = offers.find((o) => o.id === r.offer_id);
      if (!offer) return false;
      if (group === "mine" && !isResponseInitiator(currentUser.id, r)) {
        return false;
      }
      if (group === "incoming" && offer.author_id !== currentUser.id) {
        return false;
      }
      if (category !== "all") {
        if (offer.commodity_category !== category) return false;
      }
      return (
        r.respondent_id === currentUser.id || offer.author_id === currentUser.id
      );
    });
  }, [negotiations, offers, currentUser.id, group, category]);

  const groupTabs = [
    { id: "all", label: "Все" },
    { id: "mine", label: "Я откликнулся" },
    { id: "incoming", label: "Откликнулись на моё" },
  ];

  const catTabs = [
    { id: "all", label: "Все категории" },
    { id: "energy", label: "ЭЭ" },
    { id: "capacity", label: "Мощность" },
    { id: "service", label: "Услуги" },
  ];

  return (
    <PageWrapper title="Мои переговоры">
      <Tabs
        tabs={groupTabs}
        active={group}
        onChange={(id) => setGroup(id as GroupTab)}
      />
      <Tabs
        className="mt-4"
        tabs={catTabs}
        active={category}
        onChange={(id) => setCategory(id as typeof category)}
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {mine.length === 0 ? (
          <p className="text-sm text-ink-400 md:col-span-2">
            Переговоры не&nbsp;найдены
          </p>
        ) : (
          mine.map((r) => <NegotiationListCard key={r.id} response={r} />)
        )}
      </div>
    </PageWrapper>
  );
}
