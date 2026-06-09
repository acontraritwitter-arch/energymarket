"use client";

import { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/contexts/AppContext";
import { useCurrentUser } from "@/hooks";
import {
  NOTIFICATION_TYPE_LABELS,
  ROLE_LABELS,
  ROLE_SHORT_LABELS,
} from "@/lib/constants";
import type { NotificationType } from "@/lib/types";
import { formatDateRu, regionLabel } from "@/lib/utils";

const notifyTypes: NotificationType[] = [
  "N03",
  "N04",
  "N05",
  "N07",
  "N10",
  "N11",
  "N12",
];

export default function ProfilePage() {
  const { dispatch } = useApp();
  const { user, organization } = useCurrentUser();
  const [contactName, setContactName] = useState(
    organization.contact_full_name ?? user.full_name,
  );
  const [contactEmail, setContactEmail] = useState(
    organization.contact_email ?? user.email,
  );
  const [contactPhone, setContactPhone] = useState(
    organization.contact_phone ?? user.phone,
  );
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [channels, setChannels] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(notifyTypes.map((t) => [t, true])),
  );

  const saveContacts = () => {
    dispatch({
      type: "UPDATE_ORGANIZATION",
      org: {
        ...organization,
        contact_full_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <PageWrapper title="Профиль">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6" animate={false}>
          <h2 className="text-lg font-semibold text-ink">Контактные данные</h2>
          <p className="mt-1 text-sm text-ink-400">
            {organization.name} · {ROLE_SHORT_LABELS[user.role]}
          </p>
          <div className="mt-4 space-y-3">
            <Input
              id="contact_name"
              label="Контактное лицо"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
            <Input
              id="contact_email"
              label="Email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <Input
              id="contact_phone"
              label="Телефон"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
          <Button className="mt-4" onClick={saveContacts}>
            Сохранить
          </Button>
          {saved && (
            <p className="mt-2 text-sm text-success">Изменения сохранены</p>
          )}
        </Card>

        <Card className="p-6" animate={false}>
          <h2 className="text-lg font-semibold text-ink">Смена пароля</h2>
          <Input
            id="password"
            label="Новый пароль"
            type="password"
            className="mt-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="mt-4" variant="secondary" disabled={!password}>
            Обновить пароль
          </Button>
          <p className="mt-2 text-xs text-ink-400">
            В&nbsp;демо-версии смена пароля не&nbsp;сохраняется на&nbsp;сервере.
          </p>
        </Card>

        <Card className="p-6 lg:col-span-2" animate={false}>
          <h2 className="text-lg font-semibold text-ink">Каналы уведомлений</h2>
          <ul className="mt-4 space-y-3">
            {notifyTypes.map((type) => (
              <li
                key={type}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-3 last:border-0"
              >
                <span className="text-sm text-ink-600">
                  {NOTIFICATION_TYPE_LABELS[type]}
                </span>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={channels[type]}
                    onChange={(e) =>
                      setChannels((c) => ({ ...c, [type]: e.target.checked }))
                    }
                  />
                  Email
                </label>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 lg:col-span-2" animate={false}>
          <h2 className="text-lg font-semibold text-ink">Публичный профиль</h2>
          <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <div>
              <dt className="text-ink-400">Роль</dt>
              <dd>{ROLE_LABELS[user.role]}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Регион</dt>
              <dd>{regionLabel(organization.region)}</dd>
            </div>
            <div>
              <dt className="text-ink-400">ИНН</dt>
              <dd className="font-mono">{organization.inn}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Завершённых согласий</dt>
              <dd>{organization.completed_agreements_count ?? 0}</dd>
            </div>
            <div>
              <dt className="text-ink-400">На&nbsp;площадке с</dt>
              <dd>{formatDateRu(organization.created_at.slice(0, 10))}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Статус</dt>
              <dd>{organization.status === "active" ? "Активен" : organization.status}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </PageWrapper>
  );
}
