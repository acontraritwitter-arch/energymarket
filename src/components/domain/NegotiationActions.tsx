"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/contexts/AppContext";
import {
  buildAgreementFromIteration,
  createNotification,
} from "@/lib/app-actions";
import { COMMENT_MAX_LENGTH } from "@/lib/constants";
import { isResponseInitiator } from "@/lib/negotiation";
import type { CommodityCategory, Offer, OfferResponse } from "@/lib/types";

/** Блок действий в переговорах */
export function NegotiationActions({
  response,
  offer,
  category,
  isMyTurn,
}: {
  response: OfferResponse;
  offer: Offer;
  category: CommodityCategory;
  isMyTurn: boolean;
}) {
  const { dispatch, currentUser, users, organizations, iterations } = useApp();
  const [showCounter, setShowCounter] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [comment, setComment] = useState("");
  const [price, setPrice] = useState("");
  const [volume, setVolume] = useState("");

  if (!isMyTurn) return null;

  const responseIters = iterations.filter((i) => i.response_id === response.id);
  const lastIter = [...responseIters].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];

  const accept = () => {
    const iteration = {
      id: `iter_${Date.now()}`,
      response_id: response.id,
      author_id: currentUser.id,
      action: "accept" as const,
      comment,
      created_at: new Date().toISOString(),
      ...pickParams(),
    };
    const updated: OfferResponse = {
      ...response,
      status: "agreed",
      last_action_at: iteration.created_at,
      last_action_type: "accept",
    };
    dispatch({ type: "ADD_ITERATION", iteration, response: updated });
    const agreement = buildAgreementFromIteration(
      updated,
      offer,
      { ...iteration, ...lastIter },
      organizations,
    );
    dispatch({ type: "ADD_AGREEMENT", agreement });
    const parties = [offer.author_id, response.respondent_id];
    parties.forEach((uid) => {
      dispatch({
        type: "ADD_NOTIFICATION",
        notification: createNotification({
          user_id: uid,
          type: "N07",
          title: "Принципиальное согласие достигнуто",
          body: "Зафиксированы согласованные условия.",
          related_entity_type: "agreement",
          related_entity_id: agreement.id,
          is_read: false,
          channel: "system_email",
          category_filter: "negotiations",
        }),
      });
    });
  };

  function pickParams() {
    if (category === "energy") {
      return {
        price: Number(price) || lastIter?.price || offer.price,
        volume_energy:
          Number(volume) || lastIter?.volume_energy || offer.volume_max,
        period_start: offer.period_start,
        period_end: offer.period_end,
      };
    }
    if (category === "capacity") {
      return {
        price_capacity:
          Number(price) || lastIter?.price_capacity || offer.capacity_price,
        volume_capacity:
          Number(volume) || lastIter?.volume_capacity || offer.capacity_volume,
        period_start: offer.period_start,
        period_end: offer.period_end,
      };
    }
    return {
      service_price_text: price || lastIter?.service_price_text,
      service_terms: comment || lastIter?.service_terms,
    };
  }

  const counter = () => {
    const iteration = {
      id: `iter_${Date.now()}`,
      response_id: response.id,
      author_id: currentUser.id,
      action: "counter" as const,
      comment,
      created_at: new Date().toISOString(),
      ...pickParams(),
    };
    const updated: OfferResponse = {
      ...response,
      status: "counter_received",
      last_action_at: iteration.created_at,
      last_action_type: "counter",
    };
    dispatch({ type: "ADD_ITERATION", iteration, response: updated });
    const notifyUserId =
      currentUser.id === offer.author_id
        ? response.respondent_id
        : offer.author_id;
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: createNotification({
        user_id: notifyUserId,
        type:
          currentUser.id === offer.author_id ? "N05" : "N06",
        title: "Контрпредложение",
        body: "Получено новое контрпредложение в переговорах.",
        related_entity_type: "offer_response",
        related_entity_id: response.id,
        is_read: false,
        channel: "system_email",
        category_filter: "negotiations",
      }),
    });
    setShowCounter(false);
  };

  const terminate = () => {
    const iteration = {
      id: `iter_${Date.now()}`,
      response_id: response.id,
      author_id: currentUser.id,
      action: "terminate" as const,
      comment,
      created_at: new Date().toISOString(),
    };
    const updated: OfferResponse = {
      ...response,
      status: "terminated",
      last_action_at: iteration.created_at,
      last_action_type: "terminate",
    };
    dispatch({ type: "ADD_ITERATION", iteration, response: updated });
    setConfirmEnd(false);
  };

  const withdraw = () => {
    const iteration = {
      id: `iter_${Date.now()}`,
      response_id: response.id,
      author_id: currentUser.id,
      action: "withdraw" as const,
      comment,
      created_at: new Date().toISOString(),
    };
    dispatch({
      type: "ADD_ITERATION",
      iteration,
      response: {
        ...response,
        status: "withdrawn",
        last_action_at: iteration.created_at,
        last_action_type: "withdraw",
      },
    });
  };

  return (
    <div className="space-y-3 rounded-xl border border-surface-border bg-surface p-4">
      <p className="text-sm font-semibold text-ink">Ваш ход</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="success" type="button" onClick={accept}>
          ✓ Принять условия
        </Button>
        <Button type="button" onClick={() => setShowCounter(!showCounter)}>
          ↺ Контрпредложение
        </Button>
        <Button variant="ghost" type="button" onClick={() => setConfirmEnd(true)}>
          ✕ Прекратить переговоры
        </Button>
        {isResponseInitiator(currentUser.id, response) && (
          <Button variant="danger" type="button" onClick={withdraw}>
            Отозвать отклик
          </Button>
        )}
      </div>
      {showCounter && (
        <div className="space-y-2 border-t border-surface-border pt-3">
          {category !== "service" && (
            <>
              <Input
                label={
                  category === "energy"
                    ? "Цена, ₽/МВт·ч"
                    : "Цена, ₽/МВт/мес."
                }
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
              />
              <Input
                label={
                  category === "energy" ? "Объём, МВт·ч/час" : "Объём, МВт"
                }
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                type="number"
              />
            </>
          )}
          {category === "service" && (
            <Input
              label="Предлагаемая цена"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          )}
          <label className="block text-sm">
            Комментарий
            <textarea
              className="mt-1 w-full rounded-lg border border-surface-border p-2 text-sm"
              maxLength={COMMENT_MAX_LENGTH}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <span className="text-xs text-ink-400">
              {comment.length}/{COMMENT_MAX_LENGTH}
            </span>
          </label>
          <Button type="button" onClick={counter}>
            Отправить контрпредложение
          </Button>
        </div>
      )}
      <Modal
        open={confirmEnd}
        onClose={() => setConfirmEnd(false)}
        title="Прекратить переговоры?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmEnd(false)}>
              Отмена
            </Button>
            <Button variant="danger" onClick={terminate}>
              Прекратить
            </Button>
          </>
        }
      >
        <p>Переговоры будут завершены без достижения согласия.</p>
      </Modal>
    </div>
  );
}
