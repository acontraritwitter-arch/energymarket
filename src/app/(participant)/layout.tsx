"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header, Sidebar } from "@/components/layout";
import type { ReactNode } from "react";
import { Home, Search, Handshake, Bell, FileText } from "lucide-react";

const mobileNav = [
  { href: "/dashboard", icon: Home, label: "Главная" },
  { href: "/catalog", icon: Search, label: "Каталог" },
  { href: "/offers", icon: FileText, label: "Предложения" },
  { href: "/negotiations", icon: Handshake, label: "Переговоры" },
  { href: "/notifications", icon: Bell, label: "Уведомления" },
];

export default function ParticipantLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      <Sidebar mode="participant" />
      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        <Header breadcrumbs={[{ label: "Личный кабинет" }]} />
        {children}
      </div>
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-surface-border bg-surface md:hidden"
        aria-label="Мобильная навигация"
      >
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center py-2 text-[10px] ${
                active ? "text-energy" : "text-ink-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
