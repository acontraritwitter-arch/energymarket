import type { AppState } from "@/contexts/AppContext";
import type {
  CommodityCategory,
  NegotiationIteration,
  Notification,
  Offer,
  OfferResponse,
} from "./types";

export function createNotification(
  partial: Omit<Notification, "id" | "sent_at">,
): Notification {
  return {
    ...partial,
    id: `not_${Date.now()}`,
    sent_at: new Date().toISOString(),
  };
}

export function buildAgreementFromIteration(
  response: OfferResponse,
  offer: Offer,
  last: NegotiationIteration,
  organizations: AppState["organizations"],
) {
  const sellerOrg =
    offer.direction === "sell"
      ? organizations.find((o) => o.id === offer.organization_id)!
      : organizations.find(
          (o) => o.id === response.respondent_organization_id,
        )!;
  const buyerOrg =
    offer.direction === "sell"
      ? organizations.find(
          (o) => o.id === response.respondent_organization_id,
        )!
      : organizations.find((o) => o.id === offer.organization_id)!;

  const agreedAt = new Date().toISOString();
  const iters = { iteration_count: 0, negotiation_days: 1 };

  const base = {
    id: `agr_${Date.now()}`,
    response_id: response.id,
    seller_id: sellerOrg.id,
    buyer_id: buyerOrg.id,
    commodity_category: offer.commodity_category,
    status: "agreed" as const,
    agreed_at: agreedAt,
    created_at: agreedAt,
    has_green_attrs: offer.has_green_attrs,
    ...iters,
  };

  if (offer.commodity_category === "energy") {
    return {
      ...base,
      final_price: last.price ?? offer.price,
      final_price_type: offer.price_type,
      final_price_peak: last.price_peak ?? offer.price_peak,
      final_price_semipeak: last.price_semipeak ?? offer.price_semipeak,
      final_price_offpeak: last.price_offpeak ?? offer.price_offpeak,
      final_volume_energy: last.volume_energy ?? offer.volume_max,
      final_period_start: last.period_start ?? offer.period_start,
      final_period_end: last.period_end ?? offer.period_end,
      generation_type: offer.generation_type,
      generation_object: offer.generation_object,
      delivery_profile: offer.delivery_profile,
    };
  }
  if (offer.commodity_category === "capacity") {
    return {
      ...base,
      final_capacity_price: last.price_capacity ?? offer.capacity_price,
      final_capacity_price_type: offer.capacity_price_type,
      final_capacity_volume: last.volume_capacity ?? offer.capacity_volume,
      final_cap_period_start: last.period_start ?? offer.period_start,
      final_cap_period_end: last.period_end ?? offer.period_end,
      generation_type: offer.generation_type,
      generation_object: offer.generation_object,
      installed_capacity: offer.installed_capacity,
    };
  }
  return {
    ...base,
    service_category: offer.service_category,
    final_service_price: last.service_price_text ?? offer.service_price_text,
    final_service_terms: last.service_terms,
    final_service_price_numeric: offer.service_price_numeric,
  };
}

export function snapshotFromOffer(offer: Offer): Partial<NegotiationIteration> {
  if (offer.commodity_category === "energy") {
    return {
      price: offer.price,
      price_peak: offer.price_peak,
      price_semipeak: offer.price_semipeak,
      price_offpeak: offer.price_offpeak,
      volume_energy: offer.volume_max,
      period_start: offer.period_start,
      period_end: offer.period_end,
    };
  }
  if (offer.commodity_category === "capacity") {
    return {
      price_capacity: offer.capacity_price,
      volume_capacity: offer.capacity_volume,
      period_start: offer.period_start,
      period_end: offer.period_end,
    };
  }
  return {
    service_price_text: offer.service_price_text,
    service_terms: offer.service_description,
  };
}

export function displayCategoryUnit(cat: CommodityCategory): string {
  if (cat === "energy") return "₽/МВт·ч";
  if (cat === "capacity") return "₽/МВт/мес.";
  return "";
}
