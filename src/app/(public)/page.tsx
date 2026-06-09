"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RoleSwitcher } from "@/components/ui/RoleSwitcher";
import {
  APP_NAME,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  PILOT_PP_REFERENCE,
  PILOT_REGIONS,
  REGION_LABELS,
} from "@/lib/constants";
import { getPublicStats, getDemoUsers } from "@/lib/mock-data";
import { useApp } from "@/contexts/AppContext";
import { cardEntrance } from "@/lib/constants";

/** Лендинг и вход */
export default function LandingPage() {
  const router = useRouter();
  const { setCurrentUserId, currentUser } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const stats = getPublicStats();

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    const demo = getDemoUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    const userId = demo?.id ?? currentUser.id;
    setCurrentUserId(userId);
    const role = demo?.role ?? currentUser.role;
    router.push(role === "operator" ? "/op-dashboard" : "/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-energy-faint to-surface-2">
      <header className="border-b border-surface-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <p className="text-sm font-bold text-ink md:text-base">{APP_NAME}</p>
          <Link href="/register">
            <Button variant="secondary" size="sm">
              Подать заявку
            </Button>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <motion.h1
              {...cardEntrance}
              className="text-3xl font-bold tracking-tight text-ink md:text-4xl"
            >
              Торговая площадка электрической энергии и мощности
            </motion.h1>
            <p className="mt-4 text-ink-500">
              Пилотный проект в соответствии с {PILOT_PP_REFERENCE} — подбор
              контрагентов, предложения и переговоры по ЭЭ, мощности и
              сопутствующим услугам.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {(["energy", "capacity", "service"] as const).map((c, i) => (
                <motion.div
                  key={c}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-surface-border bg-surface p-4"
                >
                  <span className="text-2xl">{CATEGORY_ICONS[c]}</span>
                  <p className="mt-2 text-sm font-medium">{CATEGORY_LABELS[c]}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <Stat label="Участников" value={stats.participants} />
              <Stat label="Активных предложений" value={stats.activeOffers} />
              <Stat label="Согласий" value={stats.agreements} />
            </div>
            <div className="mt-8">
              <p className="text-sm font-semibold text-ink">7 пилотных регионов</p>
              <ul className="mt-2 grid gap-1 text-sm text-ink-500 sm:grid-cols-2">
                {PILOT_REGIONS.map((r) => (
                  <li key={r}>📍 {REGION_LABELS[r]}</li>
                ))}
              </ul>
            </div>
          </div>
          <motion.div
            {...cardEntrance}
            className="rounded-2xl border border-surface-border bg-surface p-6 shadow-lg"
          >
            <h2 className="text-lg font-semibold">Вход в систему</h2>
            <form onSubmit={login} className="mt-4 space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="energy@zavod-priborov.ru"
                required
              />
              <Input
                label="Пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                Войти
              </Button>
            </form>
            <div className="mt-6">
              <RoleSwitcher />
            </div>
            <p className="mt-4 text-center text-xs text-ink-400">
              Нет аккаунта?{" "}
              <Link href="/register" className="text-energy hover:underline">
                Подать заявку
              </Link>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-surface p-3 text-center border border-surface-border">
      <p className="font-mono text-2xl font-bold text-energy">{value}</p>
      <p className="text-xs text-ink-400">{label}</p>
    </div>
  );
}
