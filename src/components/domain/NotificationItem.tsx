"use client";

import Link from "next/link";
import { Bell, FileText, Handshake } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import type { Notification } from "@/lib/types";
import { relativeDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

function linkFor(n: Notification): string {
  if (n.related_entity_type === "offer" && n.related_entity_id) {
    return `/catalog/${n.related_entity_id}`;
  }
  if (
    n.related_entity_type === "offer_response" &&
    n.related_entity_id
  ) {
    return `/negotiations/${n.related_entity_id}`;
  }
  if (n.related_entity_type === "agreement" && n.related_entity_id) {
    return `/agreements/${n.related_entity_id}`;
  }
  if (n.related_entity_type === "registration") {
    return "/op-participants";
  }
  return "/notifications";
}

/** Элемент списка уведомлений */
export function NotificationItem({ item }: { item: Notification }) {
  const { dispatch } = useApp();
  const Icon =
    item.category_filter === "negotiations"
      ? Handshake
      : item.category_filter === "offers"
        ? FileText
        : Bell;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-surface-border p-4",
        !item.is_read && "border-l-4 border-l-energy bg-surface-2",
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink-400" />
      <div className="min-w-0 flex-1">
        <Link href={linkFor(item)} className="block hover:text-energy">
          <p className="font-medium text-ink">{item.title}</p>
          <p className="mt-1 text-sm text-ink-500">{item.body}</p>
          <p className="mt-2 text-xs text-ink-300">{relativeDate(item.sent_at)}</p>
        </Link>
      </div>
      <button
        type="button"
        aria-label="Удалить уведомление"
        className="text-ink-300 hover:text-error"
        onClick={() => dispatch({ type: "DELETE_NOTIFICATION", id: item.id })}
      >
        ×
      </button>
    </div>
  );
}
