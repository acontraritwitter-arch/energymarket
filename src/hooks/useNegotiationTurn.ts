"use client";

import { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { getTurnUserId, isMyTurn } from "@/lib/negotiation";
import type { OfferResponse } from "@/lib/types";

/** Чей ход в переговорах по отклику */
export function useNegotiationTurn(response: OfferResponse | undefined) {
  const { currentUser, offers, iterations } = useApp();

  return useMemo(() => {
    if (!response) {
      return { isMyTurn: false, turnUserId: null as string | null };
    }
    const offer = offers.find((o) => o.id === response.offer_id);
    if (!offer) {
      return { isMyTurn: false, turnUserId: null };
    }
    const responseIterations = iterations.filter(
      (i) => i.response_id === response.id,
    );
    const turnUserId = getTurnUserId(response, offer, responseIterations);
    return {
      isMyTurn: isMyTurn(
        response,
        offer,
        responseIterations,
        currentUser.id,
      ),
      turnUserId,
      offer,
      iterations: responseIterations,
    };
  }, [response, currentUser.id, offers, iterations]);
}
