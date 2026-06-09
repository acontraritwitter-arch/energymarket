"use client";

import { useApp } from "@/contexts/AppContext";
import { ROLE_SHORT_LABELS } from "@/lib/constants";
import { getDemoUsers } from "@/lib/mock-data";
import { useRouter } from "next/navigation";

/** Переключатель демо-пользователя */
export function RoleSwitcher() {
  const { currentUser, setCurrentUserId } = useApp();
  const router = useRouter();
  const demoUsers = getDemoUsers();

  return (
    <div className="rounded-lg border border-dashed border-ink-200 bg-surface-2 p-2">
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-ink-400">
        🔧 Демо-режим
      </p>
      <label className="sr-only" htmlFor="demo-user-select">
        Войти как
      </label>
      <select
        id="demo-user-select"
        value={currentUser.id}
        onChange={(e) => {
          setCurrentUserId(e.target.value);
          const u = demoUsers.find((x) => x.id === e.target.value);
          if (u?.role === "operator") {
            router.push("/op-dashboard");
          } else {
            router.push("/dashboard");
          }
        }}
        className="w-full rounded-md border border-surface-border bg-surface px-2 py-1.5 text-xs"
      >
        {demoUsers.map((u) => (
          <option key={u.id} value={u.id}>
            {ROLE_SHORT_LABELS[u.role]} — {u.full_name}
          </option>
        ))}
      </select>
    </div>
  );
}
