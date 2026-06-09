"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { NotificationItem } from "@/components/domain";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { useApp } from "@/contexts/AppContext";

type FilterTab = "all" | "negotiations" | "offers" | "system";

export default function NotificationsPage() {
  const { notifications, currentUser, dispatch } = useApp();
  const [filter, setFilter] = useState<FilterTab>("all");

  const list = useMemo(() => {
    let items = notifications.filter((n) => n.user_id === currentUser.id);
    if (filter !== "all") {
      items = items.filter((n) => n.category_filter === filter);
    }
    return items.sort(
      (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime(),
    );
  }, [notifications, currentUser.id, filter]);

  const unread = notifications.filter(
    (n) => n.user_id === currentUser.id && !n.is_read,
  ).length;

  const tabs = [
    { id: "all", label: "Все", badge: unread },
    { id: "negotiations", label: "Переговоры" },
    { id: "offers", label: "Предложения" },
    { id: "system", label: "Системные" },
  ];

  return (
    <PageWrapper
      title="Уведомления"
      action={
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            dispatch({
              type: "MARK_ALL_NOTIFICATIONS_READ",
              userId: currentUser.id,
            })
          }
          disabled={unread === 0}
        >
          Отметить все как прочитанные
        </Button>
      }
    >
      <Tabs
        tabs={tabs}
        active={filter}
        onChange={(id) => setFilter(id as FilterTab)}
      />

      <div className="mt-6 space-y-3">
        {list.length === 0 ? (
          <p className="text-sm text-ink-400">Уведомлений нет</p>
        ) : (
          list.map((n) => (
            <div
              key={n.id}
              onClick={() =>
                !n.is_read &&
                dispatch({ type: "MARK_NOTIFICATION_READ", id: n.id })
              }
              role="presentation"
            >
              <NotificationItem item={n} />
            </div>
          ))
        )}
      </div>

      <p className="mt-8 text-center text-xs text-ink-300">
        Непрочитанных: {unread}.{" "}
        <Link href="/dashboard" className="text-energy hover:underline">
          На&nbsp;главную
        </Link>
      </p>
    </PageWrapper>
  );
}
