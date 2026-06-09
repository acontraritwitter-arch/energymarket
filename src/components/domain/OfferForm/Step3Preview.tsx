"use client";

import { OfferCard } from "../OfferCard";
import type { Offer } from "@/lib/types";

/** Шаг 3 — предпросмотр карточки */
export function Step3Preview({ offer }: { offer: Offer }) {
  return <OfferCard offer={offer} />;
}
