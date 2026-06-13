"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { CreatePriceVersionForm } from "@/features/products/prices/components/create-price-version-form";
import { CurrentPriceCard } from "@/features/products/prices/components/current-price-card";
import { ExpandableSection } from "@/features/products/prices/components/expandable-section";
import { ProductPriceHistoryTable } from "@/features/products/prices/components/product-price-history-table";
import {
  SalesChannelSelector,
  type SelectableSalesChannel,
} from "@/features/products/prices/components/sales-channel-selector";
import { useCreateProductPrice } from "@/features/products/prices/hooks/use-create-product-price";
import { useCurrentProductPrice } from "@/features/products/prices/hooks/use-current-product-price";
import { useProductPrices } from "@/features/products/prices/hooks/use-product-prices";
import { useCurrentProductCost } from "@/features/products/costs/hooks/use-current-product-cost";
import { useCreateProductCost } from "@/features/products/costs/hooks/use-create-product-cost";
import { useProductCosts } from "@/features/products/costs/hooks/use-product-costs";
import { CreateCostVersionForm } from "@/features/products/costs/components/create-cost-version-form";
import { ProductCostHistoryTable } from "@/features/products/costs/components/product-cost-history-table";
import { useProduct } from "@/features/products/hooks/use-product";
import { useSalesChannels } from "@/features/sales-channels/hooks/use-sales-channels";
import { useUsers } from "@/features/users/hooks/use-users";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isNotFoundError } from "@/lib/api/query-utils";

type ProductPricesPageProps = {
  productId: string;
};

export function ProductPricesPage({ productId }: ProductPricesPageProps) {
  const { user } = useAuth();
  const canMutate = user?.role === "ADMIN" || user?.role === "MANAGER";
  const canReadUsers = user?.role === "ADMIN";

  const [selectedChannelId, setSelectedChannelId] = useState<string | undefined>();
  const [priceSuccessMessage, setPriceSuccessMessage] = useState<string | undefined>();
  const [costSuccessMessage, setCostSuccessMessage] = useState<string | undefined>();
  const productQuery = useProduct(productId);
  const channelsQuery = useSalesChannels();
  const allPricesQuery = useProductPrices(productId);
  const currentCostQuery = useCurrentProductCost(productId);
  const costsQuery = useProductCosts(productId);
  const usersQuery = useUsers(canReadUsers);
  const createPriceMutation = useCreateProductPrice(productId);
  const createCostMutation = useCreateProductCost(productId);

  const selectableChannels = useMemo<SelectableSalesChannel[]>(() => {
    const allChannels = channelsQuery.data ?? [];
    const historyChannelIds = new Set(
      (allPricesQuery.data ?? []).map((item) => item.salesChannelId)
    );
    const activeChannels = allChannels.filter((channel) => channel.active);
    const inactiveChannelsWithHistory = allChannels.filter(
      (channel) => !channel.active && historyChannelIds.has(channel.id)
    );

    return [...activeChannels, ...inactiveChannelsWithHistory];
  }, [allPricesQuery.data, channelsQuery.data]);
  const initialChannelId = useMemo(
    () =>
      selectableChannels.find((channel) => channel.active)?.id ??
      selectableChannels[0]?.id,
    [selectableChannels]
  );
  const effectiveChannelId = selectedChannelId ?? initialChannelId;
  const currentPriceQuery = useCurrentProductPrice(productId, effectiveChannelId);
  const pricesQuery = useProductPrices(productId, effectiveChannelId);
  const selectedChannel = useMemo(
    () => selectableChannels.find((channel) => channel.id === effectiveChannelId),
    [effectiveChannelId, selectableChannels]
  );
  const userNameById = useMemo(() => {
    return new Map(
      (usersQuery.data ?? []).map((item) => [
        item.id,
        `${item.firstName} ${item.lastName}`.trim() || item.email,
      ])
    );
  }, [usersQuery.data]);
  const getCreatedByName = (userId: string | null) => {
    if (!userId) {
      return "-";
    }

    return userNameById.get(userId) ?? "Usuario registrado";
  };
  const currentPriceMissing =
    currentPriceQuery.data === null || isNotFoundError(currentPriceQuery.error);
  const currentCostMissing =
    currentCostQuery.data === null || isNotFoundError(currentCostQuery.error);
  if (productQuery.isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <LoadingState
          title="Cargando producto"
          message="Estamos preparando la pantalla de precios."
          className="w-full max-w-none shadow-none"
        />
      </section>
    );
  }

  if (productQuery.error || !productQuery.data) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="Catalogo"
          title="Precios del producto"
          description="Administracion historica de precios por canal."
        />
        <ErrorMessage
          title="No se pudo cargar el producto"
          messages={getApiErrorMessages(productQuery.error)}
        />
      </section>
    );
  }

  const product = productQuery.data;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Catalogo"
        title={`Precios de ${product.name}`}
        description="Consulta precio de venta, costo vigente y margen para editar precio y costo desde un solo lugar."
        actions={
          <Link href={`/products/${productId}`} className="text-sm underline-offset-4 hover:underline">
            Volver al detalle
          </Link>
        }
      />

      <ExpandableSection
        title="Valores vigentes"
        description="Precio de venta, costo actual y margen estimado."
        defaultOpen
      >
        <CurrentPriceCard
          currentPrice={currentPriceQuery.data ?? undefined}
          isLoading={currentPriceQuery.isLoading}
          isMissing={currentPriceMissing}
          error={currentPriceQuery.error}
          selectedChannelName={selectedChannel?.name ?? null}
          channelSelector={
            channelsQuery.isLoading ? (
              <LoadingState
                title="Cargando canales"
                message="Estamos consultando los canales de venta."
                className="w-full max-w-none shadow-none"
              />
            ) : channelsQuery.error ? (
              <ErrorMessage
                title="No se pudieron cargar los canales"
                messages={getApiErrorMessages(channelsQuery.error)}
              />
            ) : allPricesQuery.error ? (
              <ErrorMessage
                title="No se pudo preparar el selector"
                messages={getApiErrorMessages(allPricesQuery.error)}
              />
            ) : selectableChannels.length === 0 ? (
              <EmptyState
                title="Sin canales disponibles"
                message="No hay canales activos ni canales inactivos con historial para consultar precios."
                className="w-full max-w-none shadow-none"
              />
            ) : (
              <SalesChannelSelector
                channels={selectableChannels}
                selectedChannelId={effectiveChannelId}
                onChange={setSelectedChannelId}
                description=""
              />
            )
          }
          createdByName={getCreatedByName(currentPriceQuery.data?.createdById ?? null)}
          currentCost={currentCostQuery.data ?? undefined}
          isCostLoading={currentCostQuery.isLoading}
          isCostMissing={currentCostMissing}
          costError={currentCostQuery.error}
        />
      </ExpandableSection>

      <ExpandableSection
        title="Editar precio de venta"
        description="Carga un precio base y deriva automaticamente el precio final de cada canal activo."
      >
        <CreatePriceVersionForm
          channels={selectableChannels}
          currentCost={currentCostQuery.data ?? undefined}
          canSubmit={canMutate}
          isPending={createPriceMutation.isPending}
          error={createPriceMutation.error}
          successMessage={priceSuccessMessage}
          onSubmit={async (prices) => {
            setPriceSuccessMessage(undefined);
            for (const price of prices) {
              await createPriceMutation.mutateAsync(price);
            }
            setSelectedChannelId(
              prices.find((price) => price.salesChannelId === effectiveChannelId)
                ?.salesChannelId ?? prices[0]?.salesChannelId
            );
            setPriceSuccessMessage(
              `Se actualizaron ${prices.length} precios de venta desde el precio base.`
            );
          }}
        />
      </ExpandableSection>

      <ExpandableSection
        title="Editar costo"
        description="Actualiza el costo vigente del producto."
      >
        <CreateCostVersionForm
          currentCost={currentCostQuery.data ?? undefined}
          canSubmit={canMutate}
          isPending={createCostMutation.isPending}
          error={createCostMutation.error}
          successMessage={costSuccessMessage}
          onSubmit={async (values) => {
            setCostSuccessMessage(undefined);
            await createCostMutation.mutateAsync(values);
            setCostSuccessMessage("El costo vigente se actualizo correctamente.");
          }}
        />
      </ExpandableSection>

      <ExpandableSection
        title="Historiales"
        description="Consulta movimientos anteriores de costos y precios."
      >
        <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Historial de costos</CardTitle>
          </CardHeader>
          <CardContent>
            {costsQuery.isLoading ? (
              <LoadingState
                title="Cargando historial"
                message="Estamos consultando los costos anteriores del producto."
                className="w-full max-w-none shadow-none"
              />
            ) : costsQuery.error ? (
              <ErrorMessage
                title="No se pudo cargar el historial de costos"
                messages={getApiErrorMessages(costsQuery.error)}
              />
            ) : (costsQuery.data?.length ?? 0) === 0 ? (
              <EmptyState
                title="Sin historial"
                message="Todavia no existen costos anteriores para este producto."
                className="w-full max-w-none shadow-none"
              />
            ) : (
              <ProductCostHistoryTable items={costsQuery.data ?? []} />
            )}
          </CardContent>
        </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de precios</CardTitle>
            </CardHeader>
            <CardContent>
              {!effectiveChannelId ? (
                <EmptyState
                  title="Selecciona un canal"
                  message="Necesitas un canal activo para filtrar el historial."
                  className="w-full max-w-none shadow-none"
                />
              ) : pricesQuery.isLoading ? (
                <LoadingState
                  title="Cargando historial"
                  message="Estamos consultando los precios anteriores del canal seleccionado."
                  className="w-full max-w-none shadow-none"
                />
              ) : pricesQuery.error ? (
                <ErrorMessage
                  title="No se pudo cargar el historial"
                  messages={getApiErrorMessages(pricesQuery.error)}
                />
              ) : (pricesQuery.data?.length ?? 0) === 0 ? (
                <EmptyState
                  title="Sin historial"
                  message="Todavia no existen precios anteriores para este canal."
                  className="w-full max-w-none shadow-none"
                />
              ) : (
                <ProductPriceHistoryTable
                  items={pricesQuery.data ?? []}
                  getCreatedByName={getCreatedByName}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </ExpandableSection>
    </section>
  );
}
