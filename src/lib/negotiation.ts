import type {
  NegotiationIteration,
  Offer,
  OfferResponse,
  User,
} from "./types";

/** Определяет, чей ход в переговорах (FR-NEG-002) */
export function getTurnUserId(
  response: OfferResponse,
  offer: Offer,
  iterations: NegotiationIteration[],
): string | null {
  if (
    response.status === "agreed" ||
    response.status === "rejected" ||
    response.status === "withdrawn" ||
    response.status === "terminated"
  ) {
    return null;
  }
  if (response.status === "sent") {
    return offer.author_id;
  }
  if (response.status === "counter_received") {
    const sorted = [...iterations].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const last = sorted[0];
    if (!last) return offer.author_id;
    if (last.author_id === offer.author_id) {
      return response.respondent_id;
    }
    return offer.author_id;
  }
  return null;
}

export function isMyTurn(
  response: OfferResponse,
  offer: Offer,
  iterations: NegotiationIteration[],
  currentUserId: string,
): boolean {
  const turnId = getTurnUserId(response, offer, iterations);
  return turnId === currentUserId;
}

export function isOfferAuthor(userId: string, offer: Offer): boolean {
  return offer.author_id === userId;
}

export function isResponseInitiator(
  userId: string,
  response: OfferResponse,
): boolean {
  return response.respondent_id === userId;
}
