"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CategoryBadge, DirectionBadge } from "@/components/ui/CategoryBadge";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { useApp } from "@/contexts/AppContext";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/lib/constants";
import type { CommodityCategory, Offer, OfferStatus } from "@/lib/types";
import {
  formatDateRu,
  formatPrice,
  formatVolume,
  getOfferDisplayPrice,
  getOfferDisplayVolume,
  regionLabel,
} from "@/lib/utils";

const categoryTabs: { id: "all" | CommodityCategory; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "energy", label: `${CATEGORY_ICONS.energy} ${CATEGORY_LABELS.energy}` },
  { id: "capacity", label: `${CATEGORY_ICONS.capacity} ${CATEGORY_LABELS.capacity}` },
  { id: "service", label: `${CATEGORY_ICONS.service} ${CATEGORY_LABELS.service}` },
];

const statusTabs: { id: "all" | OfferStatus; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "draft", label: "Черновики" },
  { id: "active", label: "Активные" },
  { id: "in_negotiation", label: "В переговорах" },
  { id: "agreed", label: "Согласие" },
  { id: "withdrawn", label: "Отозвано" },
  { id: "expired", label: "Истёк" },
];

export default function OffersPage() {
  const { offers, dispatch, currentUser } = useApp();
  const [category, setCategory] = useState<"all" | CommodityCategory>("all");
  const [status, setStatus] = useState<"all" | OfferStatus>("all");
  const [menuId, setMenuId] = useState<string | null>(null);

  const mine = useMemo(() => {
    let list = offers.filter((o) => o.author_id === currentUser.id);
    if (category !== "all") {
      list = list.filter((o) => o.commodity_category === category);
    }
    if (status !== "all") {
      list = list.filter((o) => o.status === status);
    }
    return list.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [offers, currentUser.id, category, status]);

  const updateOffer = (offer: Offer) => {
    dispatch({ type: "UPDATE_OFFER", offer });
  };

  const publish = (offer: Offer) => {
    const updated: Offer = {
      ...offer,
      status: "active",
      published_at: new Date().toISOString(),
    };
    updateOffer(updated);
    setMenuId(null);
  };

  const withdraw = (offer: Offer) => {
    updateOffer({ ...offer, status: "withdrawn" });
    setMenuId(null);
  };

  const duplicate = (offer: Offer) => {
    const copy: Offer = {
      ...offer,
      id: `offer_${Date.now()}`,
      status: "draft",
      published_at: undefined,
      response_count: 0,
      created_at: new Date().toISOString(),
    };
    dispatch({ type: "ADD_OFFER", offer: copy });
    setMenuId(null);
  };

  const removeDraft = (offer: Offer) => {
    if (offer.status !== "draft") return;
    dispatch({
      type: "UPDATE_OFFER",
      offer: { ...offer, status: "withdrawn", hidden_by_operator: true },
    });
    setMenuId(null);
  };

  const extendValidity = (offer: Offer) => {
    const d = new Date(offer.valid_until);
    d.setMonth(d.getMonth() + 1);
    updateOffer({
      ...offer,
      valid_until: d.toISOString().slice(0, 10),
    });
    setMenuId(null);
  };

  return (
    <PageWrapper
      title="Мои предложения"
      action={
        <Link href="/offers/new">
          <Button>Новое предложение</Button>
        </Link>
      }
    >
      <Tabs
        tabs={categoryTabs.map((t) => ({ id: t.id, label: t.label }))}
        active={category}
        onChange={(id) => setCategory(id as typeof category)}
      />
      <Tabs
        className="mt-4"
        tabs={statusTabs.map((t) => ({ id: t.id, label: t.label }))}
        active={status}
        onChange={(id) => setStatus(id as typeof status)}
      />

      <div className="mt-6 overflow-x-auto rounded-xl border border-surface-border">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-surface-border bg-surface-2 text-xs text-ink-400">
            <tr>
              <th className="px-4 py-3 font-medium">Номер</th>
              <th className="px-4 py-3 font-medium">Категория</th>
              <th className="px-4 py-3 font-medium">Направление</th>
              <th className="px-4 py-3 font-medium">Цена</th>
              <th className="px-4 py-3 font-medium">Объём</th>
              <th className="px-4 py-3 font-medium">Регион</th>
              <th className="px-4 py-3 font-medium">Период</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Отклики</th>
              <th className="px-4 py-3 font-medium">Дата</th>
              <th className="px-4 py-3 font-medium" aria-label="Действия" />
            </tr>
          </thead>
          <tbody>
            {mine.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-ink-400">
                  Предложений не&nbsp;найдено
                </td>
              </tr>
            ) : (
              mine.map((offer) => {
                const priceInfo = getOfferDisplayPrice(offer);
                const vol = getOfferDisplayVolume(offer);
                return (
                  <tr
                    key={offer.id}
                    className="border-b border-surface-border last:border-0 hover:bg-surface-2/50"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{offer.id}</td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={offer.commodity_category} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <DirectionBadge direction={offer.direction} />
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {formatPrice(priceInfo.value, offer.commodity_category, {
                        text: priceInfo.text,
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {formatVolume(vol, offer.commodity_category)}
                    </td>
                    <td className="px-4 py-3">
                      {offer.region.map(regionLabel).join(", ")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDateRu(offer.period_start)} —{" "}
                      {formatDateRu(offer.period_end)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={offer.status} kind="offer" />
                    </td>
                    <td className="px-4 py-3">{offer.response_count ?? 0}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDateRu(offer.created_at.slice(0, 10))}
                    </td>
                    <td className="relative px-4 py-3">
                      <button
                        type="button"
                        className="rounded p-1 hover:bg-surface-3"
                        aria-label="Меню действий"
                        onClick={() =>
                          setMenuId(menuId === offer.id ? null : offer.id)
                        }
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuId === offer.id && (
                        <div className="absolute right-4 top-10 z-10 min-w-[180px] rounded-lg border border-surface-border bg-surface py-1 shadow-lg">
                          {offer.status === "draft" && (
                            <>
                              <button
                                type="button"
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-2"
                                onClick={() => publish(offer)}
                              >
                                Опубликовать
                              </button>
                              <button
                                type="button"
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-2"
                                onClick={() => removeDraft(offer)}
                              >
                                Удалить
                              </button>
                            </>
                          )}
                          {(offer.status === "active" ||
                            offer.status === "in_negotiation") && (
                            <button
                              type="button"
                              className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-2"
                              onClick={() => withdraw(offer)}
                            >
                              Отозвать
                            </button>
                          )}
                          {offer.status === "active" && (
                            <button
                              type="button"
                              className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-2"
                              onClick={() => extendValidity(offer)}
                            >
                              Продлить срок
                            </button>
                          )}
                          <button
                            type="button"
                            className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-2"
                            onClick={() => duplicate(offer)}
                          >
                            Дублировать
                          </button>
                          <Link
                            href={`/catalog/${offer.id}`}
                            className="block px-3 py-2 text-sm hover:bg-surface-2"
                            onClick={() => setMenuId(null)}
                          >
                            Открыть
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
