"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/contexts/AppContext";
import { useCurrentUser } from "@/hooks";
import {
  AGREEMENT_GP_BANNER,
  CONTRACT_BUTTON_TOOLTIP,
  SERVICE_CATEGORY_LABELS,
} from "@/lib/constants";
import { OPERATOR_CONTACTS } from "@/lib/mock-data";
import {
  formatDateRu,
  formatPrice,
  formatVolume,
  generationLabel,
  regionLabel,
} from "@/lib/utils";

export default function AgreementDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { agreements, organizations, offers, negotiations } = useApp();
  const { organization } = useCurrentUser();

  const agreement = agreements.find((a) => a.id === id);
  const response = agreement
    ? negotiations.find((r) => r.id === agreement.response_id)
    : undefined;
  const offer = response
    ? offers.find((o) => o.id === response.offer_id)
    : undefined;

  if (
    !agreement ||
    (agreement.seller_id !== organization.id &&
      agreement.buyer_id !== organization.id)
  ) {
    return (
      <PageWrapper title="Согласие не найдено">
        <Link href="/agreements" className="text-sm text-energy hover:underline">
          К&nbsp;списку согласий
        </Link>
      </PageWrapper>
    );
  }

  const seller = organizations.find((o) => o.id === agreement.seller_id);
  const buyer = organizations.find((o) => o.id === agreement.buyer_id);
  const cat = agreement.commodity_category;

  return (
    <PageWrapper
      title={`Согласие № ${agreement.id}`}
      action={
        <Link href="/agreements">
          <Button variant="secondary" size="sm">
            Назад
          </Button>
        </Link>
      }
    >
      <div className="mb-6 rounded-lg border border-cap/30 bg-cap-faint/40 p-4 text-sm text-ink-600">
        <p>{AGREEMENT_GP_BANNER}</p>
        <p className="mt-2">
          {OPERATOR_CONTACTS.organization_name}: {OPERATOR_CONTACTS.phone},{" "}
          {OPERATOR_CONTACTS.email}
        </p>
      </div>

      <Card className="p-6" animate={false}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <CategoryBadge category={cat} />
          <span className="text-sm text-ink-400">
            {formatDateRu(agreement.agreed_at)}
          </span>
        </div>
        <p className="text-lg font-semibold text-ink">
          {seller?.name} → {buyer?.name}
        </p>

        <dl className="mt-6 grid gap-3 text-sm md:grid-cols-2">
          {cat === "energy" && (
            <>
              <div>
                <dt className="text-ink-400">Цена</dt>
                <dd className="font-mono font-semibold">
                  {formatPrice(agreement.final_price, "energy")}
                </dd>
              </div>
              <div>
                <dt className="text-ink-400">Объём</dt>
                <dd className="font-mono">
                  {formatVolume(agreement.final_volume_energy, "energy")}
                </dd>
              </div>
              <div>
                <dt className="text-ink-400">Период</dt>
                <dd>
                  {formatDateRu(agreement.final_period_start)} —{" "}
                  {formatDateRu(agreement.final_period_end)}
                </dd>
              </div>
              {agreement.generation_type && (
                <div>
                  <dt className="text-ink-400">Вид генерации</dt>
                  <dd>{generationLabel(agreement.generation_type)}</dd>
                </div>
              )}
            </>
          )}
          {cat === "capacity" && (
            <>
              <div>
                <dt className="text-ink-400">Цена мощности</dt>
                <dd className="font-mono font-semibold">
                  {formatPrice(agreement.final_capacity_price, "capacity")}
                </dd>
              </div>
              <div>
                <dt className="text-ink-400">Объём</dt>
                <dd className="font-mono">
                  {formatVolume(agreement.final_capacity_volume, "capacity")}
                </dd>
              </div>
            </>
          )}
          {cat === "service" && (
            <>
              <div>
                <dt className="text-ink-400">Цена</dt>
                <dd>{agreement.final_service_price}</dd>
              </div>
              {agreement.service_category && (
                <div>
                  <dt className="text-ink-400">Категория</dt>
                  <dd>{SERVICE_CATEGORY_LABELS[agreement.service_category]}</dd>
                </div>
              )}
            </>
          )}
          {offer && (
            <div className="md:col-span-2">
              <dt className="text-ink-400">Исходное предложение</dt>
              <dd>
                <Link
                  href={`/catalog/${offer.id}`}
                  className="text-energy hover:underline"
                >
                  {offer.id}
                </Link>
                {offer.region.length > 0 && (
                  <span className="text-ink-400">
                    {" "}
                    · {offer.region.map(regionLabel).join(", ")}
                  </span>
                )}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-ink-400">Итераций переговоров</dt>
            <dd>{agreement.iteration_count ?? "—"}</dd>
          </div>
        </dl>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="secondary" disabled>
          Скачать PDF
        </Button>
        <Tooltip content={CONTRACT_BUTTON_TOOLTIP}>
          <Button disabled>Оформить договор</Button>
        </Tooltip>
      </div>
    </PageWrapper>
  );
}
