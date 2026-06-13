"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorMessage } from "@/components/feedback/error-message";
import { ForbiddenState } from "@/components/feedback/forbidden-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/common/page-header";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { CurrentStockCard } from "@/features/inventory/components/current-stock-card";
import { InventoryOperationActions } from "@/features/inventory/components/inventory-operation-actions";
import { ProductMovementHistory } from "@/features/inventory/components/product-movement-history";
import { useProductInventory } from "@/features/inventory/hooks/use-product-inventory";
import { useProduct } from "@/features/products/hooks/use-product";
import { formatStockManagementType } from "@/lib/formatters";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";

export function ProductInventoryPage({
  productId,
}: {
  productId: string;
}) {
  const { user } = useAuth();
  const canMutate = user?.role === "ADMIN" || user?.role === "MANAGER";
  const canReadMovements =
    user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "AUDITOR";

  const productQuery = useProduct(productId);
  const inventoryQuery = useProductInventory(productId);

  if (productQuery.isLoading || inventoryQuery.isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <LoadingState
          title="Cargando inventario"
          message="Estamos preparando el detalle del producto."
          className="w-full max-w-none shadow-none"
        />
      </section>
    );
  }

  const productNotFound =
    productQuery.error &&
    isApiError(productQuery.error) &&
    productQuery.error.statusCode === HTTP_STATUS.notFound;
  const inventoryForbidden =
    inventoryQuery.error &&
    isApiError(inventoryQuery.error) &&
    inventoryQuery.error.statusCode === HTTP_STATUS.forbidden;

  if (inventoryForbidden) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <ForbiddenState />
      </section>
    );
  }

  if (productQuery.error || inventoryQuery.error) {
    const product = productQuery.data;
    const isInventoryConflict =
      inventoryQuery.error &&
      isApiError(inventoryQuery.error) &&
      inventoryQuery.error.statusCode === HTTP_STATUS.conflict;

    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <PageHeader
          eyebrow="Inventario"
          title="Detalle de inventario"
          description="Consulta el stock actual y, segun el rol, el historial de movimientos."
          actions={
            <Link
              href="/inventory"
              className={buttonVariants({ variant: "outline" })}
            >
              Volver al listado
            </Link>
          }
        />
        {isInventoryConflict && product ? (
          <Card>
            <CardHeader>
              <CardTitle>Producto no inventariable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Este producto no participa en inventario porque su tipo actual es{" "}
                <span className="font-medium text-foreground">
                  {formatStockManagementType(product.stockManagementType)}
                </span>
                .
              </p>
              <p>
                `NON_STOCKED` se muestra como no controlado y `RECIPE_BASED` queda
                reservado para una fase futura.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ErrorMessage
            variant={productNotFound ? "general" : "general"}
            title={
              productNotFound
                ? "Producto no encontrado"
                : "No se pudo cargar el detalle de inventario"
            }
            messages={
              productNotFound
                ? "El producto solicitado no existe o ya no esta disponible."
                : getApiErrorMessages(inventoryQuery.error ?? productQuery.error)
            }
          />
        )}
      </section>
    );
  }

  const product = productQuery.data;
  const inventory = inventoryQuery.data;

  if (!product || !inventory) {
    return null;
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Inventario"
        title={inventory.productName}
        description="Resumen del stock actual y trazabilidad del producto finalizado."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              render={<Link href="/inventory" />}
              nativeButton={false}
              type="button"
              variant="outline"
            >
              Volver al listado
            </Button>
            <Button
              render={<Link href={`/products/${productId}`} />}
              nativeButton={false}
              type="button"
              variant="outline"
            >
              Ver producto
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,1fr)]">
        <CurrentStockCard product={product} inventory={inventory} />

        <Card>
          <CardHeader>
            <CardTitle>Politica actual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Las mutaciones manuales de inventario quedan reservadas a `ADMIN` y
              `MANAGER`.
            </p>
            <p>
              `SALE_OUT` y `VOID_REVERSAL` son movimientos internos generados por
              ventas y no exponen botones manuales.
            </p>
            <p>
              El frontend preserva cantidades como texto decimal y delega el calculo
              final al backend.
            </p>
          </CardContent>
        </Card>
      </div>

      <InventoryOperationActions
        productId={productId}
        currentStock={inventory.currentStock}
        minimumStock={inventory.minimumStock}
        stockManagementType={inventory.stockManagementType}
        canMutate={Boolean(canMutate)}
        isActive={product.active}
      />

      <ProductMovementHistory productId={productId} canRead={canReadMovements} />
    </section>
  );
}
