"use client";

import { motion } from "framer-motion";
import { pageEntrance } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Обёртка контента страницы с анимацией */
export function PageWrapper({
  children,
  className,
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div {...pageEntrance} className={cn("flex-1 p-4 md:p-6", className)}>
      {(title || action) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          {title && (
            <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
          )}
          {action}
        </div>
      )}
      {children}
    </motion.div>
  );
}
