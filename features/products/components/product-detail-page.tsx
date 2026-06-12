"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/common/page-header";
import { ProductForm } from "@/features/products/components/product-form";
import { ProductActions } from "@/features/products/components/product-actions";
import { ProductStatusBadges } from "@/features/products/components/product-status-badges";
import { useCurrentProductCost } from "@/features/products/costs/hooks/use-current-product-cost";
import { useCurrentProductPrice } from "@/features/products/prices/hooks/use-current-product-price";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useDeactivateProduct } from "@/features/products/hooks/use-deactivate-product";
import { useProduct } from "@/features/products/hooks/use-product";
import { useReactivateProduct } from "@/features/products/hooks/use-reactivate-product";
import { useUpdateProduct } from "@/features/products/hooks/use-update-product";
import { useSalesChannels } from "@/features/sales-channels/hooks/use-sales-channels";
import { formatCategoryName, formatDateTime, formatProductUnit, formatStockManagementType } from "@/lib/formatters";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isNotFoundError } from "@/lib/api/query-utils";
import { formatMoney } from "@/lib/money";

type ProductDetailPageProps = {
  productId: string;
};

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const { user } = useAuth();
  const canMutate = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [isEditOpen, setIsEditOpen] = useState(false);
  const productQuery = useProduct(productId);
  const categoriesQuery = useCategories();
  const salesChannelsQuery = useSalesChannels();
  const currentCostQuery = useCurrentProductCost(productId);
  const updateProductMutation = useUpdateProduct();
  const deactivateProductMutation = useDeactivateProduct();
  const reactivateProductMutation = useReactivateProduct();
  const firstActiveChannelId = useMemo(
    () => salesChannelsQuery.data?.find((channel) => channel.active)?.id,
    [salesChannelsQuery.data]
  );
  const currentPriceQuery = useCurrentProductPrice(productId, firstActiveChannelId);

  const categoryName = useMemo(() => {
    const product = productQuery.data;

    if (!product) {
      return undefined;
    }

    if (product.category?.name) {
      return product.category.name;
    }

    return categoriesQuery.data?.find((category) => category.id === product.categoryId)
      ?.name;
  }, [categoriesQuery.data, productQuery.data]);

  const isForbidden =
    productQuery.error &&
    isApiError(productQuery.error) &&
    productQuery.error.statusCode === HTTP_STATUS.forbidden;
  const isNotFound =
    productQuery.error &&
    isApiError(productQuery.error) &&
    productQuery.error.statusCode === HTTP_STATUS.notFound;
  const isCurrentCostMissing = isNotFoundError(currentCostQuery.error);
  const isCurrentPriceMissing = isNotFoundError(currentPriceQuery.error);

  async function handleUpdateProduct(values: {
    name: string;
    description?: string;
    sku?: string;
    categoryId?: string;
    unit: NonNullable<typeof productQuery.data>["unit"];
    stockManagementType: NonNullable<
      typeof productQuery.data
    >["stockManagementType"];
  }) {
    await updateProductMutation.mutateAsync({
      productId,
      data: values,
    });
    setIsEditOpen(false);
  }

  async function handleDeactivateProduct() {
    await deactivateProductMutation.mutateAsync(productId);
  }

  async function handleReactivateProduct() {
    await reactivateProductMutation.mutateAsync(productId);
  }

  if (productQuery.isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <LoadingState
          title="Cargando producto"
          message="Estamos preparando el detalle del producto."
          className="w-full max-w-none shadow-none"
        />
      </section>
    );
  }

  if (productQuery.error) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <PageHeader
          eyebrow="Catalogo"
          title="Detalle de producto"
          description="Vista basica del producto dentro del catalogo administrativo."
        />
        <ErrorMessage
          variant={isForbidden ? "forbidden" : "general"}
          title={
            isForbidden
              ? "Acceso restringido"
              : isNotFound
                ? "Producto no encontrado"
                : "No se pudo cargar el producto"
          }
          messages={
            isNotFound
              ? "El producto solicitado no existe o ya no esta disponible."
              : getApiErrorMessages(productQuery.error)
          }
        />
      </section>
    );
  }

  const product = productQuery.data;

  if (!product) {
    return null;
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        eyebrow="Catalogo"
        title={product.name}
        description="Detalle del producto con resumen de costos y precios versionados. Inventario sigue previsto para Sprint 6."
      />

      <Card>
        <CardHeader className="gap-3">
          <CardTitle className="flex flex-wrap items-center justify-between gap-3">
            <span>Datos basicos</span>
            <ProductStatusBadges product={product} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">SKU</p>
              <p>{product.sku || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Categoria
              </p>
              <p>{formatCategoryName(categoryName ? { name: categoryName } : null)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Unidad</p>
              <p>{formatProductUnit(product.unit)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Tipo de stock
              </p>
              <p>{formatStockManagementType(product.stockManagementType)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Creado
              </p>
              <p>{formatDateTime(product.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Actualizado
              </p>
              <p>{formatDateTime(product.updatedAt)}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Descripcion
            </p>
            <p>{product.description || "Sin descripcion"}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ProductActions
              product={product}
              canMutate={canMutate}
              onEdit={() => setIsEditOpen(true)}
              onDeactivate={() => handleDeactivateProduct()}
              onReactivate={() => handleReactivateProduct()}
              isDeactivatePending={deactivateProductMutation.isPending}
              isReactivatePending={reactivateProductMutation.isPending}
              showViewLink={false}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Costos y precios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Costo vigente
              </p>
              {currentCostQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Cargando costo vigente...</p>
              ) : currentCostQuery.error && !isCurrentCostMissing ? (
                <p className="text-sm text-destructive">
                  No se pudo cargar el costo vigente.
                </p>
              ) : isCurrentCostMissing ? (
                <p className="text-sm text-muted-foreground">Sin costo vigente.</p>
              ) : currentCostQuery.data ? (
                <p>{formatMoney(currentCostQuery.data.cost)}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Precio vigente resumido
              </p>
              {salesChannelsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Cargando canales...</p>
              ) : !firstActiveChannelId ? (
                <p className="text-sm text-muted-foreground">
                  Sin canales activos para resumir precios.
                </p>
              ) : currentPriceQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Cargando precio vigente...</p>
              ) : currentPriceQuery.error && !isCurrentPriceMissing ? (
                <p className="text-sm text-destructive">
                  No se pudo cargar el precio vigente.
                </p>
              ) : isCurrentPriceMissing ? (
                <p className="text-sm text-muted-foreground">
                  Sin precio vigente para el primer canal activo.
                </p>
              ) : currentPriceQuery.data ? (
                <p>
                  {currentPriceQuery.data.salesChannelName ?? "Canal"}:{" "}
                  {formatMoney(currentPriceQuery.data.price)}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/products/${productId}/costs`}
                className={buttonVariants({ variant: "outline" })}
              >
                Ver costos
              </Link>
              <Link
                href={`/products/${productId}/prices`}
                className={buttonVariants({ variant: "outline" })}
              >
                Ver precios
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>La gestion de inventario se implementara en Front Sprint 6.</p>
            <p>Esta pantalla no muestra stock ni movimientos reales en Sprint 4.</p>
          </CardContent>
        </Card>
      </div>

      <ProductForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Editar producto"
        description="Actualiza los datos basicos del producto sin crear stock, costos ni precios."
        submitLabel="Guardar cambios"
        categories={categoriesQuery.data ?? []}
        initialValues={{
          name: product.name,
          description: product.description ?? undefined,
          sku: product.sku ?? undefined,
          categoryId: product.categoryId ?? undefined,
          unit: product.unit,
          stockManagementType: product.stockManagementType,
        }}
        isPending={updateProductMutation.isPending}
        error={updateProductMutation.error}
        onSubmit={handleUpdateProduct}
      />
    </section>
  );
}
