"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ProductPriceForm } from "@/features/products/prices/components/product-price-form";
import { ProductPriceHistoryTable } from "@/features/products/prices/components/product-price-history-table";
import { useCreateProductPrice } from "@/features/products/prices/hooks/use-create-product-price";
import { useCurrentProductPrice } from "@/features/products/prices/hooks/use-current-product-price";
import { useProductPrices } from "@/features/products/prices/hooks/use-product-prices";
import { useProduct } from "@/features/products/hooks/use-product";
import { useSalesChannels } from "@/features/sales-channels/hooks/use-sales-channels";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isNotFoundError } from "@/lib/api/query-utils";
import { formatDateTime } from "@/lib/formatters";
import { formatMoney } from "@/lib/money";

type ProductPricesPageProps = {
  productId: string;
};

export function ProductPricesPage({ productId }: ProductPricesPageProps) {
  const { user } = useAuth();
  const canMutate = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [selectedChannelId, setSelectedChannelId] = useState<string | undefined>();
  const productQuery = useProduct(productId);
  const channelsQuery = useSalesChannels();
  const createPriceMutation = useCreateProductPrice(productId);

  const channels = useMemo(
    () => (channelsQuery.data ?? []).filter((channel) => channel.active),
    [channelsQuery.data]
  );
  const effectiveChannelId = selectedChannelId ?? channels[0]?.id;
  const currentPriceQuery = useCurrentProductPrice(productId, effectiveChannelId);
  const pricesQuery = useProductPrices(productId, effectiveChannelId);

  const currentPriceMissing = isNotFoundError(currentPriceQuery.error);
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
        description="Consulta el precio vigente por canal, crea nuevas versiones y revisa el historial sin modificar registros anteriores."
        actions={
          <Link href={`/products/${productId}`} className="text-sm underline-offset-4 hover:underline">
            Volver al detalle
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Canal seleccionado</CardTitle>
        </CardHeader>
        <CardContent>
          {channelsQuery.isLoading ? (
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
          ) : channels.length === 0 ? (
            <EmptyState
              title="Sin canales activos"
              message="No hay canales activos disponibles para administrar precios."
              className="w-full max-w-none shadow-none"
            />
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                El historial y el precio vigente se muestran para el canal seleccionado.
              </p>
              <Select
                value={effectiveChannelId}
                onValueChange={(value) => setSelectedChannelId(value ?? undefined)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precio vigente</CardTitle>
        </CardHeader>
        <CardContent>
          {!effectiveChannelId ? (
            <EmptyState
              title="Selecciona un canal"
              message="Necesitas un canal activo para consultar el precio vigente."
              className="w-full max-w-none shadow-none"
            />
          ) : currentPriceQuery.isLoading ? (
            <LoadingState
              title="Cargando precio vigente"
              message="Estamos consultando la version vigente para el canal seleccionado."
              className="w-full max-w-none shadow-none"
            />
          ) : currentPriceQuery.error && !currentPriceMissing ? (
            <ErrorMessage
              title="No se pudo cargar el precio vigente"
              messages={getApiErrorMessages(currentPriceQuery.error)}
            />
          ) : currentPriceMissing ? (
            <EmptyState
              title="Sin precio vigente"
              message="Este producto todavia no tiene un precio vigente para el canal seleccionado."
              className="w-full max-w-none shadow-none"
            />
          ) : currentPriceQuery.data ? (
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Canal</p>
                <p>{currentPriceQuery.data.salesChannelName ?? currentPriceQuery.data.salesChannelId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precio</p>
                <p className="text-lg font-medium">
                  {formatMoney(currentPriceQuery.data.price)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vigente desde</p>
                <p>{formatDateTime(currentPriceQuery.data.validFrom)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Creado por</p>
                <p>{currentPriceQuery.data.createdById ?? "-"}</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nueva version</CardTitle>
        </CardHeader>
        <CardContent>
          {canMutate ? (
            channels.length > 0 ? (
              <ProductPriceForm
                channels={channels}
                initialChannelId={effectiveChannelId}
                canSubmit={canMutate}
                isPending={createPriceMutation.isPending}
                error={createPriceMutation.error}
                onSubmit={async (values) => {
                  setSelectedChannelId(values.salesChannelId);
                  await createPriceMutation.mutateAsync(values);
                }}
              />
            ) : (
              <EmptyState
                title="Sin canales disponibles"
                message="Necesitas al menos un canal activo para crear una version de precio."
                className="w-full max-w-none shadow-none"
              />
            )
          ) : (
            <EmptyState
              title="Solo lectura"
              message="Tu rol puede consultar precios vigentes e historiales, pero no crear nuevas versiones."
              className="w-full max-w-none shadow-none"
            />
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
              message="Estamos consultando las versiones del canal seleccionado."
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
              message="Todavia no existen versiones historicas de precio para este canal."
              className="w-full max-w-none shadow-none"
            />
          ) : (
            <ProductPriceHistoryTable items={pricesQuery.data ?? []} />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
