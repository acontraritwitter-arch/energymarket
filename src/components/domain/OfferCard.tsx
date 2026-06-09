"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CategoryBadge, DirectionBadge } from "@/components/ui/CategoryBadge";
import { useApp } from "@/contexts/AppContext";
import type { Offer } from "@/lib/types";
import {
  formatDateRu,
  formatPrice,
  formatVolume,
  getOfferDisplayPrice,
  getOfferDisplayVolume,
  regionLabel,
} from "@/lib/utils";

interface OfferCardProps {
  offer: Offer;
  showResponseCount?: boolean;
}

/** Карточка предложения в каталоге */
export function OfferCard({ offer, showResponseCount }: OfferCardProps) {
  const { organizations, currentUser } = useApp();
  const org = organizations.find((o) => o.id === offer.organization_id);
  const isOwn = offer.author_id === currentUser.id;
  const priceInfo = getOfferDisplayPrice(offer);
  const vol = getOfferDisplayVolume(offer);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group rounded-xl border border-surface-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <CategoryBadge category={offer.commodity_category} size="sm" />
        <DirectionBadge direction={offer.direction} />
        {offer.has_green_attrs && (
          <span className="text-xs text-svc" title="Атрибуты генерации">
            🌿
          </span>
        )}
      </div>
      <p className="text-sm text-ink-500">{org?.name}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-ink">
        {formatPrice(priceInfo.value, offer.commodity_category, {
          text: priceInfo.text,
        })}
      </p>
      {vol != null && (
        <p className="font-mono text-sm text-ink-400">
          {formatVolume(vol, offer.commodity_category)}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-400">
        <span>{offer.region.map(regionLabel).join(", ")}</span>
        <span>
          {formatDateRu(offer.period_start)} — {formatDateRu(offer.period_end)}
        </span>
        <span>до {formatDateRu(offer.valid_until)}</span>
      </div>
      {showResponseCount && isOwn && (offer.response_count ?? 0) > 0 && (
        <p className="mt-2 text-xs text-ink-400">
          Откликов: {offer.response_count}
        </p>
      )}
      <Link
        href={`/catalog/${offer.id}`}
        className="mt-4 inline-flex rounded-lg bg-energy px-3 py-1.5 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        aria-label="Подробнее о предложении"
      >
        Подробнее
      </Link>
    </motion.div>
  );
}
