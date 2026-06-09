"use client";

import { motion } from "framer-motion";
import { cardEntrance } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Карточка с анимацией появления */
export function Card({
  className,
  children,
  animate = true,
}: {
  className?: string;
  children?: ReactNode;
  animate?: boolean;
}) {
  const styles = cn(
    "rounded-xl border border-surface-border bg-surface shadow-sm",
    className,
  );
  if (!animate) {
    return <div className={styles}>{children}</div>;
  }
  return (
    <motion.div className={styles} {...cardEntrance}>
      {children}
    </motion.div>
  );
}
