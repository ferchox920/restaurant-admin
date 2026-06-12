"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ProductCostForm } from "@/features/products/costs/components/product-cost-form";
import { ProductCostHistoryTable } from "@/features/products/costs/components/product-cost-history-table";
import { useCreateProductCost } from "@/features/products/costs/hooks/use-create-product-cost";
import { useCurrentProductCost } from "@/features/products/costs/hooks/use-current-product-cost";
import { useProductCosts } from "@/features/products/costs/hooks/use-product-costs";
import { useProduct } from "@/features/products/hooks/use-product";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isNotFoundError } from "@/lib/api/query-utils";
import { formatDateTime } from "@/lib/formatters";
import { formatMoney } from "@/lib/money";

type ProductCostsPageProps = {
  productId: string;
};

export function ProductCostsPage({ productId }: ProductCostsPageProps) {
  const { user } = useAuth();
  const canMutate = user?.role === "ADMIN" || user?.role === "MANAGER";

  const productQuery = useProduct(productId);
  const currentCostQuery = useCurrentProductCost(productId);
  const costsQuery = useProductCosts(productId);
  const createCostMutation = useCreateProductCost(productId);

  const isCurrentCostMissing = isNotFoundError(currentCostQuery.error);

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
        description="Consulta el costo vigente, crea nuevas versiones y revisa el historial sin editar registros anteriores."
        actions={
          <Link href={`/products/${productId}`} className="text-sm underline-offset-4 hover:underline">
            Volver al detalle
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Costo vigente</CardTitle>
        </CardHeader>
        <CardContent>
          {currentCostQuery.isLoading ? (
            <LoadingState
              title="Cargando costo vigente"
              message="Estamos consultando la version vigente."
              className="w-full max-w-none shadow-none"
            />
          ) : currentCostQuery.error && !isCurrentCostMissing ? (
            <ErrorMessage
              title="No se pudo cargar el costo vigente"
              messages={getApiErrorMessages(currentCostQuery.error)}
            />
          ) : isCurrentCostMissing ? (
            <EmptyState
              title="Sin costo vigente"
              message="Este producto todavia no tiene una version vigente de costo."
              className="w-full max-w-none shadow-none"
            />
          ) : currentCostQuery.data ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Costo</p>
                <p className="text-lg font-medium">
                  {formatMoney(currentCostQuery.data.cost)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vigente desde</p>
                <p>{formatDateTime(currentCostQuery.data.validFrom)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Creado por</p>
                <p>{currentCostQuery.data.createdById ?? "-"}</p>
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
            <ProductCostForm
              canSubmit={canMutate}
              isPending={createCostMutation.isPending}
              error={createCostMutation.error}
              onSubmit={async (values) => {
                await createCostMutation.mutateAsync(values);
              }}
            />
          ) : (
            <EmptyState
              title="Solo lectura"
              message="Tu rol puede consultar costos vigentes e historiales, pero no crear nuevas versiones."
              className="w-full max-w-none shadow-none"
            />
          )}
        </CardContent>
      </Card>

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
        </CardContent>
      </Card>
    </section>
  );
}
