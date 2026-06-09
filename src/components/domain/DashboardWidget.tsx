"use client";

import { animate } from "framer-motion";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import Link from "next/link";

/** Виджет дашборда с анимацией счётчика */
export function DashboardWidget({
  title,
  value,
  href,
  subtitle,
  className,
}: {
  title: string;
  value: number;
  href?: string;
  subtitle?: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const ctrl = animate(0, value, {
      duration: 0.55,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [value]);

  const content = (
    <Card animate className={cn("p-4", className)}>
      <p className="text-sm text-ink-400">{title}</p>
      <p className="mt-1 font-mono text-3xl font-bold text-ink">{display}</p>
      {subtitle && <p className="mt-1 text-xs text-ink-300">{subtitle}</p>}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }
  return content;
}
