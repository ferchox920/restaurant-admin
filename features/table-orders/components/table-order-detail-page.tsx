"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { ForbiddenState } from "@/components/feedback/forbidden-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { TableOrderStatusBadge } from "@/features/table-orders/components/table-order-status-badge";
import { TableOrderTotalCard } from "@/features/table-orders/components/table-order-total-card";
import { useAddTableOrderItem } from "@/features/table-orders/hooks/use-add-table-order-item";
import { useCancelTableOrder } from "@/features/table-orders/hooks/use-cancel-table-order";
import { useCloseTableOrder } from "@/features/table-orders/hooks/use-close-table-order";
import { useRemoveTableOrderItem } from "@/features/table-orders/hooks/use-remove-table-order-item";
import { useTableOrder } from "@/features/table-orders/hooks/use-table-order";
import { useUpdateTableOrderItem } from "@/features/table-orders/hooks/use-update-table-order-item";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useAllProducts as useProducts } from "@/features/products/hooks/use-all-products";
import { useAllPaymentBanks as usePaymentBanks } from "@/features/payment-banks/hooks/use-all-payment-banks";
import type { SaleProductOption } from "@/features/sales/types/sale-ticket.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";
import { isNotFoundError } from "@/lib/api/query-utils";
import { formatDateTime } from "@/lib/formatters";
import { usePosCatalog } from "@/features/pos/hooks/use-pos-catalog";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { posCatalogEnabled } from "@/lib/env";

type Props = {
  orderId: string;
};

const TableOrderWorkspace = dynamic(
  () =>
    import("@/features/table-orders/components/table-order-workspace").then(
      (module) => module.TableOrderWorkspace
    ),
  {
    loading: () => (
      <LoadingState
        title="Cargando catalogo"
        message="Estamos preparando los consumos disponibles."
        className="w-full max-w-none shadow-none"
      />
    ),
  }
);

const TableOrderItemsTable = dynamic(
  () =>
    import("@/features/table-orders/components/table-order-items-table").then(
      (module) => module.TableOrderItemsTable
    )
);

export function TableOrderDetailPage({ orderId }: Props) {
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategoryId, setCatalogCategoryId] = useState<string>();
  const debouncedCatalogSearch = useDebouncedValue(catalogSearch.trim(), 300);
  const { user } = useAuth();
  const canMutate =
    user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "CASHIER";
  const canViewCosts =
    user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "AUDITOR";
  const orderQuery = useTableOrder(orderId);
  const shouldLoadOrderResources = Boolean(
    canMutate && orderQuery.data?.status === "OPEN"
  );
  const posCatalogQuery = usePosCatalog(
    {
      salesChannelId: orderQuery.data?.saleTicket.salesChannelId ?? "",
      search: debouncedCatalogSearch || undefined,
      categoryId: catalogCategoryId,
    },
    posCatalogEnabled && shouldLoadOrderResources
  );
  const productsQuery = useProducts(
    { active: true },
    { enabled: shouldLoadOrderResources && !posCatalogEnabled }
  );
  const paymentBanksQuery = usePaymentBanks(
    { active: true },
    { enabled: shouldLoadOrderResources }
  );
  const addItemMutation = useAddTableOrderItem(orderId);
  const updateItemMutation = useUpdateTableOrderItem(orderId);
  const removeItemMutation = useRemoveTableOrderItem(orderId);
  const cancelOrderMutation = useCancelTableOrder(orderId);
  const closeOrderMutation = useCloseTableOrder(orderId);

  const products = useMemo<SaleProductOption[]>(
    () => {
      if (posCatalogEnabled) {
        return posCatalogQuery.data?.pages.flatMap((page) => page.items) ?? [];
      }
      return (
      (productsQuery.data ?? [])
        .filter((product) => product.active && product.stockManagementType !== "RECIPE_BASED")
        .map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          sku: product.sku,
          categoryId: product.categoryId,
          categoryName: product.category?.name ?? null,
          unit: product.unit,
          stockManagementType: product.stockManagementType,
          active: product.active,
        }))
      );
    },
    [posCatalogQuery.data, productsQuery.data]
  );
  const catalogCategories = posCatalogQuery.data?.pages[0]?.categories;

  if (orderQuery.isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <LoadingState
          title="Cargando orden"
          message="Estamos preparando el detalle de la orden."
          className="w-full max-w-none shadow-none"
        />
      </section>
    );
  }

  const isForbidden =
    orderQuery.error &&
    isApiError(orderQuery.error) &&
    orderQuery.error.statusCode === HTTP_STATUS.forbidden;
  const isNotFound = isNotFoundError(orderQuery.error);

  if (isForbidden) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <ForbiddenState />
      </section>
    );
  }

  if (orderQuery.error) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <ErrorMessage
          title={isNotFound ? "Orden no encontrada" : "No se pudo cargar la orden"}
          messages={
            isNotFound
              ? "La orden solicitada no existe o ya no esta disponible."
              : getApiErrorMessages(orderQuery.error)
          }
        />
      </section>
    );
  }

  const order = orderQuery.data;

  if (!order) {
    return null;
  }

  const isOpen = order.status === "OPEN";
  const canEdit = canMutate && isOpen;
  const hasItems = order.saleTicket.items.length > 0;
  const pendingItemId =
    (updateItemMutation.variables && "itemId" in updateItemMutation.variables
      ? updateItemMutation.variables.itemId
      : null) ??
    removeItemMutation.variables ??
    null;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Orden de mesa"
        title={`Mesa ${order.tableCode}`}
        description={
          order.tableName
            ? `${order.tableName}${order.tableArea ? ` · ${order.tableArea}` : ""}`
            : order.tableArea || "Gestiona los consumos y el cierre de la mesa."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <TableOrderStatusBadge status={order.status} />
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link href="/floor">
                  <ArrowLeft aria-hidden="true" />
                  Volver al salón
                </Link>
              }
            />
          </div>
        }
      />

      {canEdit ? (
        <>
          <Card size="sm">
            <CardContent className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Área</p>
                <p className="mt-1 font-medium">{order.tableArea || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Orden abierta</p>
                <p className="mt-1 font-medium">
                  {formatDateTime(order.openedAt)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Notas</p>
                <p className="mt-1 font-medium">{order.notes || "Sin notas"}</p>
              </div>
            </CardContent>
          </Card>
          <TableOrderWorkspace
            order={order}
            products={products}
            catalogCategories={catalogCategories}
            remoteFiltering={posCatalogEnabled}
            hasMoreProducts={Boolean(posCatalogQuery.hasNextPage)}
            isLoadingMoreProducts={posCatalogQuery.isFetchingNextPage}
            onCatalogSearchChange={setCatalogSearch}
            onCatalogCategoryChange={setCatalogCategoryId}
            onLoadMoreProducts={() => void posCatalogQuery.fetchNextPage()}
            isProductsLoading={posCatalogEnabled ? posCatalogQuery.isLoading : productsQuery.isLoading}
            productsError={posCatalogQuery.error ?? productsQuery.error}
            isAddingItem={addItemMutation.isPending}
            isUpdatingItem={updateItemMutation.isPending}
            isRemovingItem={removeItemMutation.isPending}
            addError={addItemMutation.error}
            updateError={updateItemMutation.error}
            removeError={removeItemMutation.error}
            paymentBanks={(paymentBanksQuery.data ?? []).filter((bank) => bank.active)}
            isPaymentBanksLoading={paymentBanksQuery.isLoading}
            isCancelPending={cancelOrderMutation.isPending}
            isClosePending={closeOrderMutation.isPending}
            cancelError={cancelOrderMutation.error}
            closeError={closeOrderMutation.error}
            onAddItem={async (values) => {
              await addItemMutation.mutateAsync({
                ...values,
                ...(order.version ? { expectedVersion: order.version } : {}),
              });
            }}
            onUpdateItem={async (itemId, values) => {
              await updateItemMutation.mutateAsync({
                itemId,
                data: {
                  ...values,
                  ...(order.version ? { expectedVersion: order.version } : {}),
                },
              });
            }}
            onRemoveItem={async (itemId) => {
              await removeItemMutation.mutateAsync(itemId);
            }}
            onCancel={async (values) => {
              await cancelOrderMutation.mutateAsync({
                ...values,
                ...(order.version ? { expectedVersion: order.version } : {}),
              });
            }}
            onClose={async (values) => {
              await closeOrderMutation.mutateAsync({
                ...values,
                ...(order.version ? { expectedVersion: order.version } : {}),
              });
            }}
          />
        </>
      ) : (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_22rem]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-3">
                Estado
                <TableOrderStatusBadge status={order.status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
              <p>Area: {order.tableArea || "-"}</p>
              <p>Ticket: {order.saleTicketId}</p>
              <p>Apertura: {formatDateTime(order.openedAt)}</p>
              <p>Cierre: {formatDateTime(order.closedAt)}</p>
              <p>Cancelacion: {formatDateTime(order.cancelledAt)}</p>
              <p>Notas: {order.notes || "-"}</p>
              {order.status === "CANCELLED" ? (
                <p className="md:col-span-2">
                  Motivo: {order.cancelReason || "-"} No afecto stock.
                </p>
              ) : null}
              {order.status === "CLOSED" ? (
                <p className="md:col-span-2">
                  Venta confirmada por backend. El stock fue descontado al cierre.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consumos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasItems ? (
                <TableOrderItemsTable
                  items={order.saleTicket.items}
                  canEdit={canEdit}
                  canViewCosts={Boolean(canViewCosts)}
                  isUpdatingItem={updateItemMutation.isPending}
                  updateError={updateItemMutation.error}
                  removeError={removeItemMutation.error}
                  pendingItemId={pendingItemId}
                  onUpdateItem={async (itemId, values) => {
                    await updateItemMutation.mutateAsync({ itemId, data: values });
                  }}
                  onRemoveItem={async (itemId) => {
                    await removeItemMutation.mutateAsync(itemId);
                  }}
                />
              ) : (
                <EmptyState
                  title="Orden sin consumos"
                  message={
                    isOpen
                      ? "Agrega consumos antes de cerrar la orden."
                      : "Esta orden no registra consumos."
                  }
                  className="w-full max-w-none shadow-none"
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <TableOrderTotalCard order={order} />

          {isOpen ? (
            <Card>
              <CardHeader>
                <CardTitle>Acciones de orden</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Orden abierta en modo lectura. Tu rol no permite mutaciones.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
      )}
    </section>
  );
}
