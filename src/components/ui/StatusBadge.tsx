import { OFFER_STATUS_LABELS, RESPONSE_STATUS_LABELS } from "@/lib/constants";
import type { OfferStatus, ResponseStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "./Badge";

/** Бейдж статуса предложения или отклика */
export function StatusBadge({
  status,
  kind = "offer",
}: {
  status: OfferStatus | ResponseStatus;
  kind?: "offer" | "response";
}) {
  const label =
    kind === "offer"
      ? OFFER_STATUS_LABELS[status as OfferStatus]
      : RESPONSE_STATUS_LABELS[status as ResponseStatus];
  const colors: Partial<Record<string, string>> = {
    active: "bg-energy-faint text-energy-dark",
    draft: "bg-ink-50 text-ink-500",
    in_negotiation: "bg-cap-faint text-cap-dark",
    agreed: "bg-green-50 text-green-700",
    sent: "bg-buy-faint text-buy",
    counter_received: "bg-warning/15 text-amber-800",
  };
  return (
    <Badge className={cn(colors[status] ?? "bg-surface-3 text-ink-600")}>
      {label}
    </Badge>
  );
}
