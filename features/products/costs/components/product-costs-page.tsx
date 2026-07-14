"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { CreateCostVersionForm } from "@/features/products/costs/components/create-cost-version-form";
import { CurrentCostCard } from "@/features/products/costs/components/current-cost-card";
import { ProductCostHistoryTable } from "@/features/products/costs/components/product-cost-history-table";
import { useCreateProductCost } from "@/features/products/costs/hooks/use-create-product-cost";
import { useCurrentProductCost } from "@/features/products/costs/hooks/use-current-product-cost";
import { useProductCosts } from "@/features/products/costs/hooks/use-product-costs";
import { useProduct } from "@/features/products/hooks/use-product";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { PaginationControls } from "@/components/common/pagination-controls";
import { DEFAULT_PAGE_LIMIT } from "@/lib/api/pagination";
import { isNotFoundError } from "@/lib/api/query-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProductCostsPageProps = {
  productId: string;
};

export function ProductCostsPage({ productId }: ProductCostsPageProps) {
  const [offset, setOffset] = useState(0);
  const { user } = useAuth();
  const canMutate = user?.role === "ADMIN" || user?.role === "MANAGER";
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const productQuery = useProduct(productId);
  const currentCostQuery = useCurrentProductCost(productId);
  const costsQuery = useProductCosts(productId, { limit: DEFAULT_PAGE_LIMIT, offset });
  const createCostMutation = useCreateProductCost(productId);

  const isCurrentCostMissing =
    currentCostQuery.data === null || isNotFoundError(currentCostQuery.error);

  if (productQuery.isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <LoadingState
          title="Cargando producto"
          message="Estamos preparando la pantalla de costos."
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
          title="Costos del producto"
          description="Administracion historica de costos."
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
        title={`Costos de ${product.name}`}
        description={`SKU ${product.sku || "-"} - Consulta el costo vigente, crea nuevas versiones y revisa el historial sin editar registros anteriores.`}
        actions={
          <Link
            href={`/products/${productId}`}
            className="text-sm underline-offset-4 hover:underline"
          >
            Volver al detalle
          </Link>
        }
      />

      <CurrentCostCard
        cost={currentCostQuery.data ?? undefined}
        isLoading={currentCostQuery.isLoading}
        isMissing={isCurrentCostMissing}
        error={currentCostQuery.error}
      />

      <CreateCostVersionForm
        currentCost={currentCostQuery.data ?? undefined}
        canSubmit={canMutate}
        isPending={createCostMutation.isPending}
        error={createCostMutation.error}
        successMessage={successMessage}
        onSubmit={async (values) => {
          setSuccessMessage(undefined);
          await createCostMutation.mutateAsync(values);
          setSuccessMessage("El costo vigente se actualizo y el historial se refresco.");
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Historial de costos</CardTitle>
        </CardHeader>
        <CardContent>
          {costsQuery.isLoading ? (
            <LoadingState
              title="Cargando historial"
              message="Estamos consultando las versiones registradas."
              className="w-full max-w-none shadow-none"
            />
          ) : costsQuery.error ? (
            <ErrorMessage
              title="No se pudo cargar el historial"
              messages={getApiErrorMessages(costsQuery.error)}
            />
          ) : (costsQuery.data?.length ?? 0) === 0 ? (
            <EmptyState
              title="Sin historial"
              message="Todavia no existen versiones historicas de costo para este producto."
              className="w-full max-w-none shadow-none"
            />
          ) : (
            <ProductCostHistoryTable items={costsQuery.data ?? []} />
          )}
          {!costsQuery.error ? (
            <PaginationControls offset={offset} limit={DEFAULT_PAGE_LIMIT} itemCount={costsQuery.data?.length ?? 0} onOffsetChange={setOffset} disabled={costsQuery.isFetching} />
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
