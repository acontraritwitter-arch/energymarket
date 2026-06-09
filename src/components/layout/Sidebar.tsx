"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  ClipboardList,
  FileText,
  Handshake,
  Home,
  LineChart,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { APP_NAME, NAV_OPERATOR, NAV_PARTICIPANT } from "@/lib/constants";
import { getTurnUserId } from "@/lib/negotiation";
import { cn } from "@/lib/utils";
import { RoleSwitcher } from "@/components/ui/RoleSwitcher";
import { ROLE_SHORT_LABELS } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  search: Search,
  file: FileText,
  handshake: Handshake,
  check: CheckCircle2,
  chart: LineChart,
  bell: Bell,
  settings: Settings,
  users: Users,
  clipboard: ClipboardList,
};

/** Боковая навигация участника или оператора */
export function Sidebar({ mode }: { mode: "participant" | "operator" }) {
  const pathname = usePathname();
  const {
    currentUser,
    notifications,
    offers,
    negotiations,
    iterations,
    registrationApplications,
  } = useApp();

  const unread = notifications.filter(
    (n) => n.user_id === currentUser.id && !n.is_read,
  ).length;

  const myTurnCount = negotiations.filter((r) => {
    const offer = offers.find((o) => o.id === r.offer_id);
    if (!offer) return false;
    const iters = iterations.filter((i) => i.response_id === r.id);
    return getTurnUserId(r, offer, iters) === currentUser.id;
  }).length;

  const newCatalog = offers.filter(
    (o) =>
      o.status === "active" &&
      o.published_at &&
      new Date(o.published_at) > new Date(Date.now() - 7 * 86400000),
  ).length;

  const pendingApps = registrationApplications.filter(
    (a) => a.status === "pending_review",
  ).length;

  const items = mode === "operator" ? NAV_OPERATOR : NAV_PARTICIPANT;

  function badgeFor(key?: string) {
    if (key === "notifications") return unread;
    if (key === "turn") return myTurnCount;
    if (key === "catalog") return newCatalog;
    if (key === "applications") return pendingApps;
    return 0;
  }

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-surface-border bg-surface">
      <div className="border-b border-surface-border p-4">
        <p className="text-sm font-bold text-ink leading-tight">{APP_NAME}</p>
        {mode === "operator" && (
          <p className="mt-1 text-xs text-cap">Панель оператора</p>
        )}
      </div>
      <nav className="flex-1 space-y-0.5 p-3" aria-label="Основное меню">
        {items.map((item) => {
          const Icon = iconMap[item.icon] ?? Home;
          const active = pathname.startsWith(item.href);
          const badge = badgeFor("badge" in item ? item.badge : undefined);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors border-l-2",
                active
                  ? "border-energy bg-energy-faint text-energy-dark"
                  : "border-transparent text-ink-500 hover:bg-surface-2",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badge > 0 && (
                <span className="rounded-full bg-energy px-1.5 text-[10px] font-bold text-white">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-surface-border p-3 space-y-3">
        <Link
          href="/profile"
          className="flex items-center gap-2 text-sm text-ink-600"
        >
          <Settings className="h-4 w-4" />
          <div className="min-w-0">
            <p className="truncate font-medium">{currentUser.full_name}</p>
            <p className="truncate text-xs text-ink-400">
              {ROLE_SHORT_LABELS[currentUser.role]}
            </p>
          </div>
        </Link>
        <RoleSwitcher />
      </div>
    </aside>
  );
}
