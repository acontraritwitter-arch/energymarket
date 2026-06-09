"use client";

import type { ReactNode } from "react";
import { Header, Sidebar } from "@/components/layout";

export default function OperatorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar mode="operator" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header breadcrumbs={[{ label: "Панель оператора" }]} />
        {children}
      </div>
    </div>
  );
}
