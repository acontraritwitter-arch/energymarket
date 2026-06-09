"use client";

import { useApp } from "@/contexts/AppContext";

/** Текущий пользователь и организация из контекста приложения */
export function useCurrentUser() {
  const { currentUser, currentOrganization } = useApp();
  return { user: currentUser, organization: currentOrganization };
}
