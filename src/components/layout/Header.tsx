"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { initials } from "@/lib/utils";

interface HeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
}

/** Шапка с хлебными крошками и уведомлениями */
export function Header({ breadcrumbs = [] }: HeaderProps) {
  const { currentUser, notifications } = useApp();
  const unread = notifications.filter(
    (n) => n.user_id === currentUser.id && !n.is_read,
  ).length;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-surface-border bg-surface/95 px-4 backdrop-blur md:px-6">
      <nav aria-label="Хлебные крошки" className="flex min-w-0 items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.label} className="flex items-center gap-2">
            {i > 0 && <span className="text-ink-300">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="text-ink-400 hover:text-energy">
                {crumb.label}
              </Link>
            ) : (
              <span className="truncate font-medium text-ink">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-surface-border bg-surface-2 px-3 py-1.5 text-sm text-ink-400">
          <Search className="h-4 w-4" />
          <span>Поиск…</span>
        </div>
        <Link
          href="/notifications"
          className="relative rounded-lg p-2 hover:bg-surface-2"
          aria-label="Уведомления"
        >
          <Bell className="h-5 w-5 text-ink-500" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-energy px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </Link>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-energy-faint text-xs font-bold text-energy"
          aria-hidden
        >
          {initials(currentUser.full_name)}
        </div>
        <span className="hidden lg:inline text-sm font-medium text-ink">
          {currentUser.full_name}
        </span>
      </div>
    </header>
  );
}
