"use client";

import { CategoryBadge } from "@/components/ui/CategoryBadge";
import type { Agreement } from "@/lib/types";
import { formatDateRu, formatPrice, formatVolume } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";

/** Краткая карточка согласия */
export function AgreementCard({ agreement }: { agreement: Agreement }) {
  const { organizations } = useApp();
  const seller = organizations.find((o) => o.id === agreement.seller_id);
  const buyer = organizations.find((o) => o.id === agreement.buyer_id);
  const cat = agreement.commodity_category;

  return (
    <div className="rounded-lg border border-surface-border p-4">
      <div className="mb-2 flex items-center gap-2">
        <CategoryBadge category={cat} size="sm" />
        <span className="font-mono text-sm text-ink-400">№ {agreement.id}</span>
      </div>
      <p className="text-sm text-ink-600">
        {seller?.name} → {buyer?.name}
      </p>
      {cat === "energy" && (
        <p className="mt-2 font-mono text-lg font-semibold">
          {formatPrice(agreement.final_price, "energy")}
        </p>
      )}
      {cat === "capacity" && (
        <p className="mt-2 font-mono text-lg font-semibold">
          {formatPrice(agreement.final_capacity_price, "capacity")}
        </p>
      )}
      {cat === "service" && (
        <p className="mt-2 text-sm">{agreement.final_service_price}</p>
      )}
      <p className="mt-1 text-xs text-ink-400">
        {formatDateRu(agreement.agreed_at)}
      </p>
    </div>
  );
}
