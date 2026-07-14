"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/common/page-header";
import { ProductForm } from "@/features/products/components/product-form";
import { ProductActions } from "@/features/products/components/product-actions";
import { ProductStatusBadges } from "@/features/products/components/product-status-badges";
import { useCurrentProductCost } from "@/features/products/costs/hooks/use-current-product-cost";
import { StockStatusBadge } from "@/features/inventory/components/stock-status-badge";
import { useProductInventory } from "@/features/inventory/hooks/use-product-inventory";
import { useProductPrices } from "@/features/products/prices/hooks/use-product-prices";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useAllCategories as useCategories } from "@/features/categories/hooks/use-all-categories";
import { useDeactivateProduct } from "@/features/products/hooks/use-deactivate-product";
import { useProduct } from "@/features/products/hooks/use-product";
import { useReactivateProduct } from "@/features/products/hooks/use-reactivate-product";
import { useUpdateProduct } from "@/features/products/hooks/use-update-product";
import { useAllSalesChannels as useSalesChannels } from "@/features/sales-channels/hooks/use-all-sales-channels";
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
  const productPricesQuery = useProductPrices(productId);
  const updateProductMutation = useUpdateProduct();
  const deactivateProductMutation = useDeactivateProduct();
  const reactivateProductMutation = useReactivateProduct();

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
  const isCurrentCostMissing =
    currentCostQuery.data === null || isNotFoundError(currentCostQuery.error);
  const inventoryQuery = useProductInventory(
    productQuery.data?.stockManagementType === "FINISHED_PRODUCT"
      ? productId
      : undefined
  );
  const currentPricesByActiveChannel = useMemo(() => {
    const activeChannels = salesChannelsQuery.data?.filter((channel) => channel.active) ?? [];
    const prices = productPricesQuery.data ?? [];

    return activeChannels
      .map((channel) => {
        const currentPrice = prices.find(
          (price) => price.salesChannelId === channel.id && price.isCurrent
        );

        if (!currentPrice) {
          return null;
        }

        return {
          channelId: channel.id,
          channelName: channel.name,
          price: currentPrice.price,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [productPricesQuery.data, salesChannelsQuery.data]);

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
          description="Consulta la informacion del producto dentro del catalogo administrativo."
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

  const hasCurrentCost = Boolean(currentCostQuery.data);
  const hasCurrentPrice = currentPricesByActiveChannel.length > 0;
  const isOutOfStock = inventoryQuery.data?.stockStatus === "OUT_OF_STOCK";
  const isNotSaleEligible =
    !hasCurrentCost ||
    !hasCurrentPrice ||
    (product.stockManagementType === "FINISHED_PRODUCT" && isOutOfStock);
  const saleEligibilityMessages = [
    !hasCurrentCost ? "Falta definir costo vigente." : null,
    !hasCurrentPrice ? "Falta definir precio final en al menos un canal." : null,
    product.stockManagementType === "FINISHED_PRODUCT" && isOutOfStock
      ? "Producto sin stock disponible."
      : null,
  ].filter((message): message is string => Boolean(message));

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        eyebrow="Catalogo"
        title={product.name}
        description="Consulta datos comerciales, costos, precios vigentes e inventario asociado."
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
            <Button
              render={<Link href={`/products/${productId}/prices`} />}
              nativeButton={false}
              type="button"
              variant="outline"
              size="sm"
            >
              Editar costos y precios
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              <span>Costos y precios</span>
              {isNotSaleEligible ? (
                <Badge
                  variant="outline"
                  className="border-rose-200 bg-rose-50 text-rose-700"
                >
                  No elegible para venta
                </Badge>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {saleEligibilityMessages.length > 0 ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                {saleEligibilityMessages.join(" ")}
              </div>
            ) : null}

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
                <div className="space-y-1">
                  <p>{formatMoney(currentCostQuery.data.cost)}</p>
                  <p className="text-sm text-muted-foreground">
                    Vigente desde {formatDateTime(currentCostQuery.data.validFrom)}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Precios vigentes por canal
              </p>
              {salesChannelsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Cargando canales...</p>
              ) : productPricesQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Cargando resumen de precios...
                </p>
              ) : productPricesQuery.error ? (
                <p className="text-sm text-destructive">
                  No se pudo cargar el resumen de precios.
                </p>
              ) : currentPricesByActiveChannel.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sin precios vigentes para los canales activos.
                </p>
              ) : (
                <div className="space-y-1">
                  {currentPricesByActiveChannel.map((item) => (
                    <p key={item.channelId} className="text-sm">
                      <span className="text-muted-foreground">{item.channelName}:</span>{" "}
                      {formatMoney(item.price)}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/products/${productId}/prices`}
                className={buttonVariants({ variant: "outline" })}
              >
                Editar costos y precios
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {product.stockManagementType === "FINISHED_PRODUCT" ? (
              <>
                {inventoryQuery.isLoading ? (
                  <p>Cargando resumen de inventario...</p>
                ) : inventoryQuery.error ? (
                  <p className="text-destructive">
                    No se pudo cargar el resumen operativo de inventario.
                  </p>
                ) : inventoryQuery.data ? (
                  <div className="space-y-3">
                    {inventoryQuery.data.stockStatus === "OUT_OF_STOCK" ? (
                      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                        No elegible para venta: producto sin stock disponible.
                      </div>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                      <StockStatusBadge status={inventoryQuery.data.stockStatus} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Stock actual
                        </p>
                        <p className="text-foreground">
                          {inventoryQuery.data.currentStock}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Stock minimo
                        </p>
                        <p className="text-foreground">
                          {inventoryQuery.data.minimumStock}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>Sin resumen operativo disponible.</p>
                )}
                <Link
                  href={`/inventory/${productId}`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Ver inventario
                </Link>
              </>
            ) : product.stockManagementType === "NON_STOCKED" ? (
              <>
                <p>Inventario no controlado.</p>
                <p>
                  Este producto no requiere seguimiento de stock ni movimientos
                  de inventario.
                </p>
              </>
            ) : (
              <>
                <p>Producto gestionado por receta.</p>
                <p>
                  El consumo de insumos se controla desde la gestion operativa
                  correspondiente.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ProductForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Editar producto"
        description="Actualiza la informacion comercial y operativa del producto."
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
