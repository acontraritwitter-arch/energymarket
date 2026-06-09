"use client";

import { useMemo, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { useApp } from "@/contexts/AppContext";
import { createNotification } from "@/lib/app-actions";
import {
  PARTICIPANT_ROLES,
  PILOT_REGIONS,
  REGION_LABELS,
  ROLE_LABELS,
  ROLE_SHORT_LABELS,
  GENERATION_LABELS,
} from "@/lib/constants";
import type {
  Organization,
  OrganizationStatus,
  RegistrationApplication,
} from "@/lib/types";
import { formatDateRu, relativeDate } from "@/lib/utils";

type TabId = "applications" | "active" | "blocked";

const APP_STATUS_LABELS: Record<RegistrationApplication["status"], string> = {
  pending_review: "На рассмотрении",
  approved: "Одобрена",
  rejected: "Отклонена",
  info_requested: "Запрошена информация",
};

const ORG_STATUS_LABELS: Record<OrganizationStatus, string> = {
  pending: "Ожидает",
  active: "Активный",
  blocked: "Заблокирован",
  info_requested: "Запрошена информация",
};

/** FR-OP-002: управление участниками */
export default function OpParticipantsPage() {
  const { dispatch, registrationApplications, organizations, currentUser } =
    useApp();

  const [tab, setTab] = useState<TabId>("applications");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");

  const [detailApp, setDetailApp] = useState<RegistrationApplication | null>(
    null,
  );
  const [detailOrg, setDetailOrg] = useState<Organization | null>(null);
  const [approveTarget, setApproveTarget] =
    useState<RegistrationApplication | null>(null);
  const [rejectTarget, setRejectTarget] =
    useState<RegistrationApplication | null>(null);
  const [infoTarget, setInfoTarget] = useState<RegistrationApplication | null>(
    null,
  );
  const [blockTarget, setBlockTarget] = useState<Organization | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [infoComment, setInfoComment] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const pendingCount = registrationApplications.filter(
    (a) => a.status === "pending_review",
  ).length;

  const matchesSearch = (name: string, inn: string) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      name.toLowerCase().includes(q) ||
      inn.includes(q.replace(/\s/g, ""))
    );
  };

  const filteredApps = useMemo(() => {
    return registrationApplications.filter((a) => {
      if (tab !== "applications") return false;
      if (!["pending_review", "info_requested", "rejected"].includes(a.status)) {
        return false;
      }
      if (roleFilter !== "all" && a.role !== roleFilter) return false;
      if (regionFilter !== "all" && a.region !== regionFilter) return false;
      return matchesSearch(a.organization_name, a.inn);
    });
  }, [registrationApplications, tab, roleFilter, regionFilter, search]);

  const filteredOrgs = useMemo(() => {
    const status: OrganizationStatus =
      tab === "blocked" ? "blocked" : "active";
    return organizations.filter((o) => {
      if (o.type === "operator") return false;
      if (tab === "applications") return false;
      if (o.status !== status) return false;
      if (roleFilter !== "all" && o.type !== roleFilter) return false;
      if (regionFilter !== "all" && o.region !== regionFilter) return false;
      return matchesSearch(o.name, o.inn);
    });
  }, [organizations, tab, roleFilter, regionFilter, search]);

  const approve = (app: RegistrationApplication) => {
    const now = new Date().toISOString();
    const orgId = `org_${Date.now()}`;
    const userId = `user_${Date.now()}`;
    const org: Organization = {
      id: orgId,
      name: app.organization_name,
      inn: app.inn,
      ogrn: app.ogrn,
      type: app.role,
      region: app.region,
      price_category: app.price_category,
      generation_type: app.generation_type,
      installed_capacity: app.installed_capacity,
      max_power: app.max_power,
      orem_contract_number: app.orem_contract_number,
      status: "active",
      created_at: now,
      verified_at: now,
      completed_agreements_count: 0,
      contact_email: app.email,
      contact_phone: app.phone,
      contact_full_name: app.contact_full_name,
    };
    dispatch({ type: "ADD_ORGANIZATION", org });
    dispatch({
      type: "ADD_USER",
      user: {
        id: userId,
        organization_id: orgId,
        email: app.email,
        full_name: app.contact_full_name,
        phone: app.phone,
        role: app.role,
        status: "active",
        created_at: now,
      },
    });
    dispatch({
      type: "UPDATE_REGISTRATION",
      app: { ...app, status: "approved", operator_comment: undefined },
    });
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: createNotification({
        user_id: userId,
        type: "N02",
        title: "Заявка одобрена",
        body: `Организация «${app.organization_name}» получила доступ к площадке.`,
        related_entity_type: "organization",
        related_entity_id: orgId,
        is_read: false,
        channel: "system_email",
        category_filter: "system",
      }),
    });
    setApproveTarget(null);
    setDetailApp(null);
  };

  const reject = () => {
    if (!rejectTarget || !rejectComment.trim()) return;
    const app = {
      ...rejectTarget,
      status: "rejected" as const,
      operator_comment: rejectComment.trim(),
    };
    dispatch({ type: "UPDATE_REGISTRATION", app });
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: createNotification({
        user_id: currentUser.id,
        type: "N02",
        title: "Заявка отклонена",
        body: `Заявка ${app.application_number}: ${rejectComment.trim()}`,
        related_entity_type: "registration",
        related_entity_id: app.id,
        is_read: true,
        channel: "system",
        category_filter: "system",
      }),
    });
    setRejectTarget(null);
    setRejectComment("");
    setDetailApp(null);
  };

  const requestInfo = () => {
    if (!infoTarget || !infoComment.trim()) return;
    const app = {
      ...infoTarget,
      status: "info_requested" as const,
      operator_comment: infoComment.trim(),
    };
    dispatch({ type: "UPDATE_REGISTRATION", app });
    setInfoTarget(null);
    setInfoComment("");
    setDetailApp(null);
  };

  const blockOrg = () => {
    if (!blockTarget || !blockReason.trim()) return;
    dispatch({
      type: "UPDATE_ORGANIZATION",
      org: { ...blockTarget, status: "blocked" },
    });
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: createNotification({
        user_id: currentUser.id,
        type: "N02",
        title: "Организация заблокирована",
        body: `${blockTarget.name}: ${blockReason.trim()}`,
        related_entity_type: "organization",
        related_entity_id: blockTarget.id,
        is_read: true,
        channel: "system",
        category_filter: "system",
      }),
    });
    setBlockTarget(null);
    setBlockReason("");
    setDetailOrg(null);
  };

  const unblockOrg = (org: Organization) => {
    dispatch({
      type: "UPDATE_ORGANIZATION",
      org: { ...org, status: "active" },
    });
    setDetailOrg(null);
  };

  const roleOptions = [
    { value: "all", label: "Все роли" },
    ...PARTICIPANT_ROLES.map((r) => ({
      value: r,
      label: ROLE_SHORT_LABELS[r],
    })),
  ];

  const regionOptions = [
    { value: "all", label: "Все регионы" },
    ...PILOT_REGIONS.map((r) => ({ value: r, label: REGION_LABELS[r] })),
  ];

  return (
    <PageWrapper title="Участники">
      <Tabs
        active={tab}
        onChange={(id) => setTab(id as TabId)}
        tabs={[
          { id: "applications", label: "Заявки", badge: pendingCount },
          { id: "active", label: "Активные" },
          { id: "blocked", label: "Заблокированные" },
        ]}
        className="mb-6"
      />

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <Input
          label="Поиск"
          placeholder="Наименование или ИНН"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          label="Роль"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          options={roleOptions}
        />
        <Select
          label="Регион"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          options={regionOptions}
        />
      </div>

      {tab === "applications" && (
        <div className="space-y-3">
          {filteredApps.length === 0 && (
            <p className="text-sm text-ink-400">Заявки не найдены</p>
          )}
          {filteredApps.map((app) => (
            <Card key={app.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{app.organization_name}</p>
                  <p className="mt-1 text-sm text-ink-500">
                    {app.application_number} · ИНН {app.inn} ·{" "}
                    {ROLE_SHORT_LABELS[app.role]}
                  </p>
                  <p className="mt-1 text-xs text-ink-400">
                    {REGION_LABELS[app.region]} · подана{" "}
                    {relativeDate(app.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{APP_STATUS_LABELS[app.status]}</Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setDetailApp(app)}
                  >
                    Профиль
                  </Button>
                  {app.status === "pending_review" && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => setApproveTarget(app)}
                      >
                        Одобрить
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setRejectTarget(app);
                          setRejectComment("");
                        }}
                      >
                        Отклонить
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setInfoTarget(app);
                          setInfoComment("");
                        }}
                      >
                        Запросить информацию
                      </Button>
                    </>
                  )}
                  {app.status === "info_requested" && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => setApproveTarget(app)}
                    >
                      Одобрить
                    </Button>
                  )}
                </div>
              </div>
              {app.operator_comment && (
                <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-sm text-ink-600">
                  Комментарий оператора: {app.operator_comment}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab !== "applications" && (
        <div className="space-y-3">
          {filteredOrgs.length === 0 && (
            <p className="text-sm text-ink-400">Участники не найдены</p>
          )}
          {filteredOrgs.map((org) => (
            <Card key={org.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{org.name}</p>
                  <p className="mt-1 text-sm text-ink-500">
                    ИНН {org.inn} · {ROLE_SHORT_LABELS[org.type]}
                  </p>
                  <p className="mt-1 text-xs text-ink-400">
                    {REGION_LABELS[org.region]} · согласий:{" "}
                    {org.completed_agreements_count ?? 0}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{ORG_STATUS_LABELS[org.status]}</Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setDetailOrg(org)}
                  >
                    Профиль
                  </Button>
                  {org.status === "active" && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setBlockTarget(org);
                        setBlockReason("");
                      }}
                    >
                      Заблокировать
                    </Button>
                  )}
                  {org.status === "blocked" && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => unblockOrg(org)}
                    >
                      Разблокировать
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!detailApp}
        onClose={() => setDetailApp(null)}
        title="Заявка на присоединение"
        footer={
          <Button variant="secondary" onClick={() => setDetailApp(null)}>
            Закрыть
          </Button>
        }
      >
        {detailApp && <ApplicationProfile app={detailApp} />}
      </Modal>

      <Modal
        open={!!detailOrg}
        onClose={() => setDetailOrg(null)}
        title="Профиль участника"
        footer={
          <Button variant="secondary" onClick={() => setDetailOrg(null)}>
            Закрыть
          </Button>
        }
      >
        {detailOrg && <OrganizationProfile org={detailOrg} />}
      </Modal>

      <Modal
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        title="Одобрить заявку"
        footer={
          <>
            <Button variant="secondary" onClick={() => setApproveTarget(null)}>
              Отмена
            </Button>
            <Button
              variant="success"
              onClick={() => approveTarget && approve(approveTarget)}
            >
              Подтвердить
            </Button>
          </>
        }
      >
        {approveTarget && (
          <p>
            Будет создана организация со статусом «Активный» и учётная запись
            контактного лица для «{approveTarget.organization_name}».
          </p>
        )}
      </Modal>

      <Modal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Отклонить заявку"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectTarget(null)}>
              Отмена
            </Button>
            <Button
              variant="danger"
              disabled={!rejectComment.trim()}
              onClick={reject}
            >
              Отклонить
            </Button>
          </>
        }
      >
        <Input
          label="Причина отклонения"
          value={rejectComment}
          onChange={(e) => setRejectComment(e.target.value)}
          placeholder="Обязательное поле"
        />
      </Modal>

      <Modal
        open={!!infoTarget}
        onClose={() => setInfoTarget(null)}
        title="Запросить информацию"
        footer={
          <>
            <Button variant="secondary" onClick={() => setInfoTarget(null)}>
              Отмена
            </Button>
            <Button
              variant="primary"
              disabled={!infoComment.trim()}
              onClick={requestInfo}
            >
              Отправить запрос
            </Button>
          </>
        }
      >
        <Input
          label="Что необходимо предоставить"
          value={infoComment}
          onChange={(e) => setInfoComment(e.target.value)}
          placeholder="Обязательное поле"
        />
      </Modal>

      <Modal
        open={!!blockTarget}
        onClose={() => setBlockTarget(null)}
        title="Заблокировать участника"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBlockTarget(null)}>
              Отмена
            </Button>
            <Button
              variant="danger"
              disabled={!blockReason.trim()}
              onClick={blockOrg}
            >
              Заблокировать
            </Button>
          </>
        }
      >
        <Input
          label="Причина блокировки"
          value={blockReason}
          onChange={(e) => setBlockReason(e.target.value)}
          placeholder="Обязательное поле"
        />
      </Modal>
    </PageWrapper>
  );
}

function ApplicationProfile({ app }: { app: RegistrationApplication }) {
  return (
    <dl className="space-y-2">
      <Row label="Номер заявки" value={app.application_number} />
      <Row label="Статус" value={APP_STATUS_LABELS[app.status]} />
      <Row label="Роль" value={ROLE_LABELS[app.role]} />
      <Row label="Организация" value={app.organization_name} />
      <Row label="ИНН / ОГРН" value={`${app.inn} / ${app.ogrn}`} />
      <Row label="Регион" value={REGION_LABELS[app.region]} />
      <Row label="Контакт" value={app.contact_full_name} />
      <Row label="E-mail" value={app.email} />
      <Row label="Телефон" value={app.phone} />
      {app.price_category && (
        <Row label="Ценовая категория" value={app.price_category} />
      )}
      {app.max_power != null && (
        <Row label="Макс. мощность" value={`${app.max_power} МВт`} />
      )}
      {app.generation_type && (
        <Row
          label="Тип генерации"
          value={GENERATION_LABELS[app.generation_type]}
        />
      )}
      {app.installed_capacity != null && (
        <Row
          label="Установленная мощность"
          value={`${app.installed_capacity} МВт`}
        />
      )}
      {app.orem_contract_number && (
        <Row label="Договор ОРЭМ" value={app.orem_contract_number} />
      )}
      <Row label="Дата подачи" value={formatDateRu(app.created_at)} />
      {app.operator_comment && (
        <Row label="Комментарий оператора" value={app.operator_comment} />
      )}
    </dl>
  );
}

function OrganizationProfile({ org }: { org: Organization }) {
  return (
    <dl className="space-y-2">
      <Row label="Наименование" value={org.name} />
      <Row label="Статус" value={ORG_STATUS_LABELS[org.status]} />
      <Row label="Роль" value={ROLE_LABELS[org.type]} />
      <Row label="ИНН / ОГРН" value={`${org.inn} / ${org.ogrn}`} />
      <Row label="Регион" value={REGION_LABELS[org.region]} />
      {org.contact_full_name && (
        <Row label="Контакт" value={org.contact_full_name} />
      )}
      {org.contact_email && <Row label="E-mail" value={org.contact_email} />}
      {org.contact_phone && <Row label="Телефон" value={org.contact_phone} />}
      {org.price_category && (
        <Row label="Ценовая категория" value={org.price_category} />
      )}
      {org.generation_type && (
        <Row
          label="Тип генерации"
          value={GENERATION_LABELS[org.generation_type]}
        />
      )}
      <Row
        label="Верификация"
        value={org.verified_at ? formatDateRu(org.verified_at) : "—"}
      />
    </dl>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2">
      <dt className="text-ink-400">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
