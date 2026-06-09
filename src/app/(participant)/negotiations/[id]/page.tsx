"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import {
  NegotiationActions,
  NegotiationThread,
} from "@/components/domain";
import { CategoryBadge, DirectionBadge } from "@/components/ui/CategoryBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/contexts/AppContext";
import { useCurrentUser, useNegotiationTurn } from "@/hooks";
import { isResponseInitiator } from "@/lib/negotiation";
import {
  formatDateRu,
  formatPrice,
  formatVolume,
  getOfferDisplayPrice,
  getOfferDisplayVolume,
  regionLabel,
} from "@/lib/utils";

export default function NegotiationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { negotiations, offers, organizations, currentUser } = useApp();
  const { organization } = useCurrentUser();

  const response = negotiations.find((r) => r.id === id);
  const { isMyTurn, offer } = useNegotiationTurn(response);
  const offerData = offer ?? offers.find((o) => o.id === response?.offer_id);

  if (!response || !offerData) {
    return (
      <PageWrapper title="Переговоры не найдены">
        <Link href="/negotiations" className="text-sm text-energy hover:underline">
          К&nbsp;списку переговоров
        </Link>
      </PageWrapper>
    );
  }

  const authorOrg = organizations.find((o) => o.id === offerData.organization_id);
  const counterOrg = organizations.find(
    (o) => o.id === response.respondent_organization_id,
  );
  const initiatorIsBuyer =
    isResponseInitiator(currentUser.id, response) &&
    offerData.direction === "sell";
  const authorIsBuyer =
    offerData.author_id === currentUser.id && offerData.direction === "buy";
  const isBuyerPerspective = initiatorIsBuyer || authorIsBuyer;

  const priceInfo = getOfferDisplayPrice(offerData);
  const vol = getOfferDisplayVolume(offerData);

  return (
    <PageWrapper
      title="Переговоры"
      action={
        <Link
          href={`/catalog/${offerData.id}`}
          className="text-sm text-energy hover:underline"
        >
          К&nbsp;предложению
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="p-4 xl:col-span-3" animate={false}>
          <h2 className="text-sm font-semibold text-ink-400">Предложение</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <CategoryBadge category={offerData.commodity_category} size="sm" />
            <DirectionBadge direction={offerData.direction} />
            <StatusBadge status={response.status} kind="response" />
          </div>
          <p className="mt-3 font-medium text-ink">{authorOrg?.name}</p>
          <p className="mt-1 text-xs text-ink-400">
            Контрагент: {counterOrg?.name ?? organization.name}
          </p>
          <p className="mt-4 font-mono text-lg font-semibold">
            {formatPrice(priceInfo.value, offerData.commodity_category, {
              text: priceInfo.text,
            })}
          </p>
          <p className="font-mono text-sm text-ink-500">
            {formatVolume(vol, offerData.commodity_category)}
          </p>
          <p className="mt-3 text-xs text-ink-400">
            {offerData.region.map(regionLabel).join(", ")}
          </p>
          <p className="text-xs text-ink-400">
            {formatDateRu(offerData.period_start)} —{" "}
            {formatDateRu(offerData.period_end)}
          </p>
          {isMyTurn ? (
            <p className="mt-4 rounded-lg bg-energy-faint px-3 py-2 text-sm font-medium text-energy-dark">
              Сейчас ваш ход
            </p>
          ) : (
            <p className="mt-4 text-sm text-ink-400">Ожидание ответа контрагента</p>
          )}
        </Card>

        <div className="xl:col-span-6">
          <NegotiationThread
            responseId={response.id}
            category={offerData.commodity_category}
            isBuyerPerspective={isBuyerPerspective}
          />
        </div>

        <div className="xl:col-span-3">
          <Card className="sticky top-4 p-4" animate={false}>
            <h2 className="mb-3 font-semibold text-ink">Действия</h2>
            <NegotiationActions
              response={response}
              offer={offerData}
              category={offerData.commodity_category}
              isMyTurn={isMyTurn}
            />
            {!isMyTurn && (
              <p className="text-sm text-ink-400">
                Доступные действия появятся, когда наступит ваш ход.
              </p>
            )}
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
