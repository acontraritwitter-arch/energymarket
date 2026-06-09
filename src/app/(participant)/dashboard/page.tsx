"use client";

import Link from "next/link";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { DashboardWidget, NotificationItem, OfferCard } from "@/components/domain";
import { useApp } from "@/contexts/AppContext";
import { useCurrentUser, useRole } from "@/hooks";
import { CATEGORY_LABELS } from "@/lib/constants";
import { canRespond } from "@/lib/role-access";
import type { CommodityCategory, Offer } from "@/lib/types";

function countByCategory(
  offers: Offer[],
  authorId: string,
  direction: "buy" | "sell",
  status: Offer["status"] = "active",
) {
  const cats: CommodityCategory[] = ["energy", "capacity", "service"];
  return cats.reduce(
    (acc, cat) => {
      acc[cat] = offers.filter(
        (o) =>
          o.author_id === authorId &&
          o.direction === direction &&
          o.status === status &&
          o.commodity_category === cat,
      ).length;
      return acc;
    },
    {} as Record<CommodityCategory, number>,
  );
}

export default function DashboardPage() {
  const {
    offers,
    negotiations,
    agreements,
    notifications,
    currentUser,
  } = useApp();
  const { organization } = useCurrentUser();
  const { role } = useRole();

  const isConsumer = role === "consumer";
  const isProducer =
    role === "producer_wholesale" || role === "producer_retail";

  const myActiveBuy = countByCategory(offers, currentUser.id, "buy");
  const myActiveSell = countByCategory(offers, currentUser.id, "sell");

  const incomingResponses = negotiations.filter((r) => {
    const offer = offers.find((o) => o.id === r.offer_id);
    return (
      offer?.author_id === currentUser.id &&
      (r.status === "sent" || r.status === "counter_received")
    );
  }).length;

  const myResponses = negotiations.filter(
    (r) => r.respondent_id === currentUser.id,
  ).length;

  const myAgreements = agreements.filter(
    (a) => a.seller_id === organization.id || a.buyer_id === organization.id,
  );

  const agreementsByCat = (["energy", "capacity", "service"] as const).reduce(
    (acc, cat) => {
      acc[cat] = myAgreements.filter((a) => a.commodity_category === cat).length;
      return acc;
    },
    {} as Record<CommodityCategory, number>,
  );

  const recommendSell = offers
    .filter(
      (o) =>
        o.status === "active" &&
        !o.hidden_by_operator &&
        o.author_id !== currentUser.id &&
        o.direction === "sell" &&
        canRespond(role, o.commodity_category, o.direction),
    )
    .slice(0, 5);

  const recommendBuy = offers
    .filter(
      (o) =>
        o.status === "active" &&
        !o.hidden_by_operator &&
        o.author_id !== currentUser.id &&
        o.direction === "buy" &&
        canRespond(role, o.commodity_category, o.direction),
    )
    .slice(0, 5);

  const recentNotifications = notifications
    .filter((n) => n.user_id === currentUser.id && !n.is_read)
    .sort(
      (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime(),
    )
    .slice(0, 5);

  const buyRequestsEnergy = offers
    .filter(
      (o) =>
        o.status === "active" &&
        o.direction === "buy" &&
        o.commodity_category === "energy" &&
        o.author_id !== currentUser.id,
    )
    .slice(0, 5);

  const buyRequestsCapacity = offers
    .filter(
      (o) =>
        o.status === "active" &&
        o.direction === "buy" &&
        o.commodity_category === "capacity" &&
        o.author_id !== currentUser.id,
    )
    .slice(0, 5);

  return (
    <PageWrapper title={`Здравствуйте, ${currentUser.full_name.split(" ")[0]}`}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isConsumer && (
          <>
            <DashboardWidget
              title="Мои запросы на\u00A0покупку"
              value={
                myActiveBuy.energy + myActiveBuy.capacity + myActiveBuy.service
              }
              subtitle={`ЭЭ: ${myActiveBuy.energy} · Мощность: ${myActiveBuy.capacity} · Услуги: ${myActiveBuy.service}`}
              href="/offers"
            />
            <DashboardWidget
              title="Входящие отклики"
              value={incomingResponses}
              href="/negotiations"
            />
            <DashboardWidget
              title="Мои отклики"
              value={myResponses}
              href="/negotiations"
            />
            <DashboardWidget
              title="Согласия"
              value={myAgreements.length}
              subtitle={`ЭЭ: ${agreementsByCat.energy} · Мощность: ${agreementsByCat.capacity} · Услуги: ${agreementsByCat.service}`}
              href="/agreements"
            />
          </>
        )}
        {isProducer && (
          <>
            <DashboardWidget
              title="Мои предложения"
              value={myActiveSell.energy + myActiveSell.capacity}
              subtitle={`ЭЭ: ${myActiveSell.energy} · Мощность: ${myActiveSell.capacity}`}
              href="/offers"
            />
            <DashboardWidget
              title="Входящие отклики"
              value={incomingResponses}
              href="/negotiations"
            />
            <DashboardWidget
              title="Согласия"
              value={myAgreements.length}
              subtitle={`ЭЭ: ${agreementsByCat.energy} · Мощность: ${agreementsByCat.capacity}`}
              href="/agreements"
            />
          </>
        )}
        {!isConsumer && !isProducer && (
          <>
            <DashboardWidget
              title="Активные предложения"
              value={
                offers.filter(
                  (o) =>
                    o.author_id === currentUser.id && o.status === "active",
                ).length
              }
              href="/offers"
            />
            <DashboardWidget
              title="Переговоры"
              value={negotiations.length}
              href="/negotiations"
            />
            <DashboardWidget
              title="Согласия"
              value={myAgreements.length}
              href="/agreements"
            />
          </>
        )}
      </div>

      {isConsumer && (
        <section className="mt-8 space-y-6">
          {recommendSell.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">
                  Рекомендации ({CATEGORY_LABELS.energy})
                </h2>
                <Link href="/catalog" className="text-sm text-energy hover:underline">
                  В&nbsp;каталог
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {recommendSell
                  .filter((o) => o.commodity_category === "energy")
                  .slice(0, 5)
                  .map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
              </div>
            </div>
          )}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">
                Рекомендации ({CATEGORY_LABELS.capacity})
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommendSell
                .filter((o) => o.commodity_category === "capacity")
                .slice(0, 5)
                .map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
            </div>
          </div>
        </section>
      )}

      {isProducer && (
        <section className="mt-8 space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              Запросы покупателей (ЭЭ)
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {buyRequestsEnergy.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              Запросы покупателей (мощность)
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {buyRequestsCapacity.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </div>
        </section>
      )}

      {!isConsumer && !isProducer && recommendSell.length + recommendBuy.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-ink">Подходящие предложения</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...recommendSell, ...recommendBuy].slice(0, 5).map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Уведомления</h2>
          <Link
            href="/notifications"
            className="text-sm font-medium text-energy hover:underline"
          >
            Все уведомления
          </Link>
        </div>
        {recentNotifications.length === 0 ? (
          <p className="text-sm text-ink-400">Нет непрочитанных уведомлений</p>
        ) : (
          <div className="space-y-3">
            {recentNotifications.map((n) => (
              <NotificationItem key={n.id} item={n} />
            ))}
          </div>
        )}
      </section>
    </PageWrapper>
  );
}
