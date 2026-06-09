"use client";

import {
  canCreateOffer,
  canRespond,
  getAvailableOfferTypes,
} from "@/lib/role-access";
import { useCurrentUser } from "./useCurrentUser";
import type { CommodityCategory, Direction } from "@/lib/types";

/** Права текущей роли по матрице §3.2 */
export function useRole() {
  const { user } = useCurrentUser();
  const role = user.role;

  return {
    role,
    isOperator: role === "operator" || role === "admin",
    isParticipant: role !== "operator" && role !== "admin",
    canCreate: (category: CommodityCategory, direction: Direction) =>
      canCreateOffer(role, category, direction),
    canRespond: (category: CommodityCategory, direction: Direction) =>
      canRespond(role, category, direction),
    availableOfferTypes: getAvailableOfferTypes(role),
  };
}
