"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import {
  agreements as initialAgreements,
  chatMessages as initialChatMessages,
  currentUserId as initialUserId,
  marketPrices as initialMarketPrices,
  negotiationIterations as initialIterations,
  notifications as initialNotifications,
  offerResponses as initialResponses,
  offers as initialOffers,
  organizations as initialOrganizations,
  registrationApplications as initialApplications,
  users as initialUsers,
  switchUser as setMockCurrentUserId,
} from "@/lib/mock-data";
import type {
  Agreement,
  ChatMessage,
  MarketPrice,
  NegotiationIteration,
  Notification,
  Offer,
  OfferResponse,
  Organization,
  RegistrationApplication,
  User,
} from "@/lib/types";

export interface AppState {
  currentUser: User;
  currentOrganization: Organization;
  offers: Offer[];
  negotiations: OfferResponse[];
  iterations: NegotiationIteration[];
  agreements: Agreement[];
  notifications: Notification[];
  marketPrices: MarketPrice[];
  organizations: Organization[];
  users: User[];
  chatMessages: ChatMessage[];
  registrationApplications: RegistrationApplication[];
}

type Action =
  | { type: "SET_USER"; userId: string }
  | { type: "ADD_OFFER"; offer: Offer }
  | { type: "UPDATE_OFFER"; offer: Offer }
  | { type: "ADD_RESPONSE"; response: OfferResponse; iteration: NegotiationIteration }
  | { type: "ADD_ITERATION"; iteration: NegotiationIteration; response: OfferResponse }
  | { type: "ADD_AGREEMENT"; agreement: Agreement }
  | { type: "ADD_NOTIFICATION"; notification: Notification }
  | { type: "MARK_NOTIFICATION_READ"; id: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ"; userId: string }
  | { type: "DELETE_NOTIFICATION"; id: string }
  | { type: "ADD_CHAT"; message: ChatMessage }
  | { type: "ADD_REGISTRATION"; app: RegistrationApplication }
  | { type: "UPDATE_REGISTRATION"; app: RegistrationApplication }
  | { type: "UPDATE_ORGANIZATION"; org: Organization }
  | { type: "ADD_ORGANIZATION"; org: Organization }
  | { type: "ADD_USER"; user: User };

function resolveUserState(
  state: Omit<AppState, "currentUser" | "currentOrganization">,
  userId: string,
): Pick<AppState, "currentUser" | "currentOrganization"> {
  const currentUser = state.users.find((u) => u.id === userId) ?? state.users[0]!;
  const currentOrganization =
    state.organizations.find((o) => o.id === currentUser.organization_id) ??
    state.organizations[0]!;
  return { currentUser, currentOrganization };
}

function buildInitialState(userId: string): AppState {
  const base = {
    offers: [...initialOffers],
    negotiations: [...initialResponses],
    iterations: [...initialIterations],
    agreements: [...initialAgreements],
    notifications: [...initialNotifications],
    marketPrices: [...initialMarketPrices],
    organizations: [...initialOrganizations],
    users: [...initialUsers],
    chatMessages: [...initialChatMessages],
    registrationApplications: [...initialApplications],
  };
  return { ...base, ...resolveUserState(base, userId) };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_USER": {
      setMockCurrentUserId(action.userId);
      return { ...state, ...resolveUserState(state, action.userId) };
    }
    case "ADD_OFFER":
      return { ...state, offers: [action.offer, ...state.offers] };
    case "UPDATE_OFFER":
      return {
        ...state,
        offers: state.offers.map((o) =>
          o.id === action.offer.id ? action.offer : o,
        ),
      };
    case "ADD_RESPONSE":
      return {
        ...state,
        negotiations: [...state.negotiations, action.response],
        iterations: [...state.iterations, action.iteration],
        offers: state.offers.map((o) =>
          o.id === action.response.offer_id
            ? {
                ...o,
                status: "in_negotiation" as const,
                response_count: (o.response_count ?? 0) + 1,
              }
            : o,
        ),
      };
    case "ADD_ITERATION":
      return {
        ...state,
        iterations: [...state.iterations, action.iteration],
        negotiations: state.negotiations.map((r) =>
          r.id === action.response.id ? action.response : r,
        ),
      };
    case "ADD_AGREEMENT":
      return {
        ...state,
        agreements: [...state.agreements, action.agreement],
        negotiations: state.negotiations.map((r) =>
          r.id === action.agreement.response_id
            ? { ...r, status: "agreed" as const }
            : r,
        ),
        offers: state.offers.map((o) => {
          const resp = state.negotiations.find(
            (n) => n.id === action.agreement.response_id,
          );
          return resp && o.id === resp.offer_id
            ? { ...o, status: "agreed" as const }
            : o;
        }),
      };
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.notification, ...state.notifications],
      };
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, is_read: true } : n,
        ),
      };
    case "MARK_ALL_NOTIFICATIONS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.user_id === action.userId ? { ...n, is_read: true } : n,
        ),
      };
    case "DELETE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.id),
      };
    case "ADD_CHAT":
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.message],
      };
    case "ADD_REGISTRATION":
      return {
        ...state,
        registrationApplications: [
          action.app,
          ...state.registrationApplications,
        ],
      };
    case "UPDATE_REGISTRATION":
      return {
        ...state,
        registrationApplications: state.registrationApplications.map((a) =>
          a.id === action.app.id ? action.app : a,
        ),
      };
    case "UPDATE_ORGANIZATION":
      return {
        ...state,
        organizations: state.organizations.map((o) =>
          o.id === action.org.id ? action.org : o,
        ),
      };
    case "ADD_ORGANIZATION":
      return {
        ...state,
        organizations: [...state.organizations, action.org],
      };
    case "ADD_USER":
      return {
        ...state,
        users: [...state.users, action.user],
      };
    default:
      return state;
  }
}

interface AppContextValue extends AppState {
  dispatch: React.Dispatch<Action>;
  setCurrentUserId: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialUserId, buildInitialState);

  const setCurrentUserId = useCallback((id: string) => {
    dispatch({ type: "SET_USER", userId: id });
  }, []);

  const value = useMemo(
    () => ({ ...state, dispatch, setCurrentUserId }),
    [state, setCurrentUserId],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
