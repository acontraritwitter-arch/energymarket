"use client";

import { useEffect, useState } from "react";

/** Имитация загрузки списков 400–600 мс */
export function usePageLoading(ms = 500): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
