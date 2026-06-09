"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CategoryBadge, DirectionBadge } from "@/components/ui/CategoryBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/contexts/AppContext";
import { useCurrentUser, useRole } from "@/hooks";
import {
  createNotification,
  snapshotFromOffer,
} from "@/lib/app-actions";
import {
  COMMENT_MAX_LENGTH,
  PRICE_TYPE_LABELS,
  SERVICE_CATEGORY_LABELS,
} from "@/lib/constants";
import type { OfferResponse } from "@/lib/types";
import {
  formatDateRu,
  formatPrice,
  formatVolume,
  generationLabel,
  getOfferDisplayPrice,
  getOfferDisplayVolume,
  regionLabel,
} from "@/lib/utils";

export default function CatalogOfferPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const {
    offers,
    organizations,
    marketPrices,
    negotiations,
    dispatch,
    currentUser,
  } = useApp();
  const { organization } = useCurrentUser();
  const { canRespond } = useRole();

  const offer = offers.find((o) => o.id === id);
  const authorOrg = organizations.find((o) => o.id === offer?.organization_id);
  const isOwn = offer?.author_id === currentUser.id;

  const [responseType, setResponseType] = useState<"accept" | "counter">("accept");
  const [comment, setComment] = useState("");
  const [price, setPrice] = useState("");
  const [volume, setVolume] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const referencePrices = useMemo(() => {
    if (!offer) return [];
    const type = offer.commodity_category === "capacity" ? "capacity" : "rsv";
    if (offer.commodity_category === "service") return [];
    return marketPrices.filter(
      (mp) =>
        mp.price_type === type &&
        offer.region.some((r) => r === mp.region),
    );
  }, [offer, marketPrices]);

  const existingResponse = negotiations.find(
    (r) => r.offer_id === id && r.respondent_id === currentUser.id,
  );

  const mayRespond =
    offer &&
    !isOwn &&
    offer.status === "active" &&
    canRespond(offer.commodity_category, offer.direction) &&
    !existingResponse;

  const relatedResponses = negotiations.filter((r) => r.offer_id === id);

  const submitResponse = () => {
    if (!offer || !mayRespond) return;
    const now = new Date().toISOString();
    const response: OfferResponse = {
      id: `resp_${Date.now()}`,
      offer_id: offer.id,
      respondent_id: currentUser.id,
      respondent_organization_id: organization.id,
      status: "sent",
      created_at: now,
      last_action_at: now,
      last_action_type: "response",
    };
    const base = snapshotFromOffer(offer);
    const iteration = {
      id: `iter_${Date.now()}`,
      response_id: response.id,
      author_id: currentUser.id,
      action: "response" as const,
      comment: comment || undefined,
      created_at: now,
      ...(responseType === "counter" && offer.commodity_category === "energy"
        ? {
            ...base,
            price: Number(price) || offer.price,
            volume_energy: Number(volume) || offer.volume_max,
          }
        : responseType === "counter" && offer.commodity_category === "capacity"
          ? {
              ...base,
              price_capacity: Number(price) || offer.capacity_price,
              volume_capacity: Number(volume) || offer.capacity_volume,
            }
          : base),
    };
    dispatch({ type: "ADD_RESPONSE", response, iteration });
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: createNotification({
        user_id: offer.author_id,
        type: "N04",
        title: "Новый отклик на предложение",
        body: `${organization.name} откликнулся на ваше предложение.`,
        related_entity_type: "offer_response",
        related_entity_id: response.id,
        is_read: false,
        channel: "system_email",
        category_filter: "negotiations",
      }),
    });
    setSubmitted(true);
    router.push(`/negotiations/${response.id}`);
  };

  if (!offer) {
    return (
      <PageWrapper title="Предложение не найдено">
        <Link href="/catalog" className="text-sm text-energy hover:underline">
          Вернуться в&nbsp;каталог
        </Link>
      </PageWrapper>
    );
  }

  const priceInfo = getOfferDisplayPrice(offer);
  const vol = getOfferDisplayVolume(offer);

  return (
    <PageWrapper
      title="Карточка предложения"
      action={
        isOwn ? (
          <Link href="/offers">
            <Button variant="secondary" size="sm">
              К&nbsp;моим предложениям
            </Button>
          </Link>
        ) : undefined
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <CategoryBadge category={offer.commodity_category} />
              <DirectionBadge direction={offer.direction} />
              <StatusBadge status={offer.status} kind="offer" />
            </div>
            <h2 className="text-xl font-semibold text-ink">{authorOrg?.name}</h2>
            <p className="mt-1 text-sm text-ink-400">
              Завершённых согласий: {authorOrg?.completed_agreements_count ?? 0}
            </p>
            <dl className="mt-6 grid gap-3 text-sm md:grid-cols-2">
              <div>
                <dt className="text-ink-400">Цена</dt>
                <dd className="font-mono font-semibold text-ink">
                  {formatPrice(priceInfo.value, offer.commodity_category, {
                    text: priceInfo.text,
                  })}
                </dd>
              </div>
              {vol != null && (
                <div>
                  <dt className="text-ink-400">Объём</dt>
                  <dd className="font-mono text-ink">
                    {formatVolume(vol, offer.commodity_category)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-ink-400">Регион</dt>
                <dd>{offer.region.map(regionLabel).join(", ")}</dd>
              </div>
              <div>
                <dt className="text-ink-400">Период</dt>
                <dd>
                  {formatDateRu(offer.period_start)} —{" "}
                  {formatDateRu(offer.period_end)}
                </dd>
              </div>
              <div>
                <dt className="text-ink-400">Срок действия</dt>
                <dd>{formatDateRu(offer.valid_until)}</dd>
              </div>
              {offer.generation_type && (
                <div>
                  <dt className="text-ink-400">Вид генерации</dt>
                  <dd>{generationLabel(offer.generation_type)}</dd>
                </div>
              )}
              {offer.price_type && (
                <div>
                  <dt className="text-ink-400">Тип цены</dt>
                  <dd>{PRICE_TYPE_LABELS[offer.price_type]}</dd>
                </div>
              )}
              {offer.service_category && (
                <div>
                  <dt className="text-ink-400">Категория услуги</dt>
                  <dd>{SERVICE_CATEGORY_LABELS[offer.service_category]}</dd>
                </div>
              )}
              {offer.generation_object && (
                <div className="md:col-span-2">
                  <dt className="text-ink-400">Объект генерации</dt>
                  <dd>{offer.generation_object}</dd>
                </div>
              )}
              {offer.description && (
                <div className="md:col-span-2">
                  <dt className="text-ink-400">Описание</dt>
                  <dd className="text-ink-600">{offer.description}</dd>
                </div>
              )}
            </dl>
          </Card>

          {isOwn && relatedResponses.length > 0 && (
            <Card className="p-4">
              <h3 className="mb-3 font-semibold text-ink">Отклики</h3>
              <ul className="space-y-2 text-sm">
                {relatedResponses.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/negotiations/${r.id}`}
                      className="text-energy hover:underline"
                    >
                      Отклик {r.id}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <aside className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-ink">Справочные цены ОРЭМ</h3>
            {offer.commodity_category === "service" ? (
              <p className="mt-2 text-sm text-ink-400">
                Для услуг справочные цены не&nbsp;применяются
              </p>
            ) : referencePrices.length === 0 ? (
              <p className="mt-2 text-sm text-ink-400">
                Данные по&nbsp;выбранному региону временно недоступны
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {referencePrices.map((mp) => (
                  <li key={mp.id} className="flex justify-between gap-2">
                    <span className="text-ink-500">
                      {regionLabel(mp.region)}, {mp.period}
                    </span>
                    <span className="font-mono text-ink">
                      {formatPrice(
                        mp.price,
                        mp.price_type === "capacity" ? "capacity" : "energy",
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {mayRespond && !submitted && (
            <Card className="p-4">
              <h3 className="font-semibold text-ink">Откликнуться</h3>
              <Select
                id="response_type"
                label="Тип отклика"
                className="mt-3"
                value={responseType}
                onChange={(e) =>
                  setResponseType(e.target.value as "accept" | "counter")
                }
                options={[
                  { value: "accept", label: "Принимаю условия" },
                  { value: "counter", label: "Контрпредложение" },
                ]}
              />
              {responseType === "counter" &&
                offer.commodity_category !== "service" && (
                  <>
                    <Input
                      id="counter_price"
                      label="Предлагаемая цена"
                      type="number"
                      className="mt-3"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                    <Input
                      id="counter_volume"
                      label="Предлагаемый объём"
                      type="number"
                      className="mt-3"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                    />
                  </>
                )}
              <label className="mt-3 block text-sm text-ink-500">
                Комментарий
                <textarea
                  className="mt-1 w-full rounded-lg border border-surface-border p-2 text-sm"
                  rows={3}
                  maxLength={COMMENT_MAX_LENGTH}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </label>
              <Button className="mt-4 w-full" onClick={submitResponse}>
                Отправить отклик
              </Button>
            </Card>
          )}

          {existingResponse && (
            <Card className="p-4">
              <p className="text-sm text-ink-600">
                Вы уже отправили отклик на&nbsp;это предложение.
              </p>
              <Link
                href={`/negotiations/${existingResponse.id}`}
                className="mt-2 inline-block text-sm text-energy hover:underline"
              >
                Перейти к&nbsp;переговорам
              </Link>
            </Card>
          )}

          {!mayRespond && !isOwn && !existingResponse && (
            <Card className="p-4">
              <p className="text-sm text-ink-500">
                Отклик для вашей роли недоступен или предложение не&nbsp;активно.
              </p>
            </Card>
          )}
        </aside>
      </div>
    </PageWrapper>
  );
}
