"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useApp } from "@/contexts/AppContext";
import { createNotification } from "@/lib/app-actions";
import { relativeDate } from "@/lib/utils";

/** Мини-чат в переговорах */
export function ChatPanel({ responseId }: { responseId: string }) {
  const { chatMessages, currentUser, users, dispatch, negotiations } =
    useApp();
  const [text, setText] = useState("");
  const messages = chatMessages
    .filter((m) => m.response_id === responseId)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

  const send = () => {
    if (!text.trim()) return;
    const msg = {
      id: `chat_${Date.now()}`,
      response_id: responseId,
      author_id: currentUser.id,
      text: text.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    };
    dispatch({ type: "ADD_CHAT", message: msg });
    const resp = negotiations.find((r) => r.id === responseId);
    if (resp) {
      const other =
        resp.respondent_id === currentUser.id
          ? users.find((u) => u.id !== currentUser.id)
          : users.find((u) => u.id === resp.respondent_id);
      if (other) {
        dispatch({
          type: "ADD_NOTIFICATION",
          notification: createNotification({
            user_id: other.id,
            type: "N11",
            title: "Новое сообщение в чате",
            body: text.slice(0, 80),
            related_entity_type: "offer_response",
            related_entity_id: responseId,
            is_read: false,
            channel: "system",
            category_filter: "negotiations",
          }),
        });
      }
    }
    setText("");
  };

  return (
    <div className="rounded-lg border border-surface-border p-4">
      <h3 className="mb-3 text-sm font-semibold text-ink">Чат</h3>
      <div className="mb-3 max-h-40 space-y-2 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-ink-400">Сообщений пока нет</p>
        )}
        {messages.map((m) => {
          const author = users.find((u) => u.id === m.author_id);
          const mine = m.author_id === currentUser.id;
          return (
            <div
              key={m.id}
              className={`rounded-lg px-3 py-2 text-sm ${
                mine ? "ml-8 bg-energy-faint" : "mr-8 bg-surface-2"
              }`}
            >
              <p className="text-xs text-ink-400">
                {author?.full_name} · {relativeDate(m.created_at)}
              </p>
              <p>{m.text}</p>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Input
          aria-label="Сообщение в чат"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите сообщение…"
          className="flex-1"
        />
        <Button type="button" onClick={send}>
          Отправить
        </Button>
      </div>
    </div>
  );
}
