"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorMessage } from "@/components/feedback/error-message";
import { EmptyState } from "@/components/feedback/empty-state";
import { ForbiddenState } from "@/components/feedback/forbidden-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { SaleTicketHeader } from "@/features/sales/components/sale-ticket-header";
import { SaleTicketItemsTable } from "@/features/sales/components/sale-ticket-items-table";
import { SaleTicketSummary } from "@/features/sales/components/sale-ticket-summary";
import { useAllPaymentBanks as usePaymentBanks } from "@/features/payment-banks/hooks/use-all-payment-banks";
import { useAddSaleTicketItem } from "@/features/sales/hooks/use-add-sale-ticket-item";
import { useCancelSaleTicket } from "@/features/sales/hooks/use-cancel-sale-ticket";
import { useConfirmSaleTicket } from "@/features/sales/hooks/use-confirm-sale-ticket";
import { useRemoveSaleTicketItem } from "@/features/sales/hooks/use-remove-sale-ticket-item";
import { useSaleTicket } from "@/features/sales/hooks/use-sale-ticket";
import { useUpdateSaleTicket } from "@/features/sales/hooks/use-update-sale-ticket";
import { useUpdateSaleTicketItem } from "@/features/sales/hooks/use-update-sale-ticket-item";
import { useVoidSaleTicket } from "@/features/sales/hooks/use-void-sale-ticket";
import type {
  ConfirmSaleTicketInput,
  SaleProductOption,
  SaleTicketPaymentFormValues,
} from "@/features/sales/types/sale-ticket.types";
import { canEditTicket } from "@/features/sales/utils/sale-ticket";
import { useAllProducts as useProducts } from "@/features/products/hooks/use-all-products";
import { useAllInventory as useInventory } from "@/features/inventory/hooks/use-all-inventory";
import { useAllCategories as useCategories } from "@/features/categories/hooks/use-all-categories";
import { usePosCatalog } from "@/features/pos/hooks/use-pos-catalog";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { posCatalogEnabled } from "@/lib/env";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";
import { isNotFoundError } from "@/lib/api/query-utils";

type SaleTicketPageProps = {
  ticketId: string;
  onBack?: () => void;
};

const SaleTicketPosWorkspace = dynamic(
  () =>
    import("@/features/sales/components/sale-ticket-pos-workspace").then(
      (module) => module.SaleTicketPosWorkspace
    ),
  {
    loading: () => (
      <LoadingState
        title="Cargando catalogo"
        message="Estamos preparando los productos disponibles."
        className="w-full max-w-none shadow-none"
      />
    ),
  }
);

const SaleTicketCriticalActions = dynamic(() =>
  import("@/features/sales/components/sale-ticket-critical-actions").then(
    (module) => module.SaleTicketCriticalActions
  )
);

export function SaleTicketPage({ ticketId, onBack }: SaleTicketPageProps) {
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategoryId, setCatalogCategoryId] = useState<string>();
  const debouncedCatalogSearch = useDebouncedValue(catalogSearch.trim(), 300);
  const { user } = useAuth();
  const canMutateDraft =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "CASHIER";
  const canVoid = user?.role === "ADMIN" || user?.role === "MANAGER";
  const canViewCosts =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "AUDITOR";

  const saleTicketQuery = useSaleTicket(ticketId);
  const shouldLoadDraftResources = Boolean(
    canMutateDraft &&
    saleTicketQuery.data &&
    canEditTicket(saleTicketQuery.data)
  );
  const posCatalogQuery = usePosCatalog(
    {
      salesChannelId: saleTicketQuery.data?.salesChannelId ?? "",
      search: debouncedCatalogSearch || undefined,
      categoryId: catalogCategoryId,
    },
    posCatalogEnabled && shouldLoadDraftResources
  );
  const paymentBanksQuery = usePaymentBanks(
    { active: true },
    { enabled: shouldLoadDraftResources }
  );
  const categoriesQuery = useCategories(
    { active: true },
    { enabled: shouldLoadDraftResources && !posCatalogEnabled }
  );
  const productsQuery = useProducts(
    { active: true },
    { enabled: shouldLoadDraftResources && !posCatalogEnabled }
  );
  const inventoryQuery = useInventory(
    { active: true },
    { enabled: shouldLoadDraftResources && !posCatalogEnabled }
  );

  const updateSaleTicketMutation = useUpdateSaleTicket();
  const cancelSaleTicketMutation = useCancelSaleTicket(ticketId);
  const confirmSaleTicketMutation = useConfirmSaleTicket(ticketId);
  const voidSaleTicketMutation = useVoidSaleTicket(ticketId);
  const addSaleTicketItemMutation = useAddSaleTicketItem(ticketId);
  const updateSaleTicketItemMutation = useUpdateSaleTicketItem(ticketId);
  const removeSaleTicketItemMutation = useRemoveSaleTicketItem(ticketId);

  const sellableProducts = useMemo<SaleProductOption[]>(() => {
    if (posCatalogEnabled) {
      return posCatalogQuery.data?.pages.flatMap((page) => page.items) ?? [];
    }
    const inventoryByProductId = new Map(
      (inventoryQuery.data ?? []).map((item) => [item.productId, item])
    );
    const categoryNamesById = new Map(
      (categoriesQuery.data ?? []).map((category) => [
        category.id,
        category.name,
      ])
    );

    return (productsQuery.data ?? [])
      .filter(
        (product) =>
          product.active && product.stockManagementType !== "RECIPE_BASED"
      )
      .map((product) => {
        const inventory = inventoryByProductId.get(product.id);

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          sku: product.sku,
          categoryId: product.categoryId,
          categoryName:
            product.category?.name ??
            (product.categoryId
              ? (categoryNamesById.get(product.categoryId) ?? null)
              : null),
          unit: product.unit,
          stockManagementType: product.stockManagementType,
          stockStatus: inventory?.stockStatus,
          currentStock: inventory?.currentStock ?? null,
          active: product.active,
        };
      });
  }, [
    categoriesQuery.data,
    inventoryQuery.data,
    posCatalogQuery.data,
    productsQuery.data,
  ]);
  const catalogCategories = posCatalogQuery.data?.pages[0]?.categories;

  if (saleTicketQuery.isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <LoadingState
          title="Cargando ticket"
          message="Estamos preparando el detalle de la venta."
          className="w-full max-w-none shadow-none"
        />
      </section>
    );
  }

  const isForbidden =
    saleTicketQuery.error &&
    isApiError(saleTicketQuery.error) &&
    saleTicketQuery.error.statusCode === HTTP_STATUS.forbidden;
  const isNotFound = isNotFoundError(saleTicketQuery.error);

  if (isForbidden) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <ForbiddenState />
      </section>
    );
  }

  if (saleTicketQuery.error) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <ErrorMessage
          title={
            isNotFound ? "Ticket no encontrado" : "No se pudo cargar el ticket"
          }
          messages={
            isNotFound
              ? "El ticket solicitado no existe o ya no esta disponible."
              : getApiErrorMessages(saleTicketQuery.error)
          }
        />
      </section>
    );
  }

  const ticket = saleTicketQuery.data;

  if (!ticket) {
    return null;
  }

  const isDraft = canEditTicket(ticket);
  const canEditDraft = canMutateDraft && isDraft;
  const hasItems = ticket.items.length > 0;
  const cancelSucceeded =
    ticket.status === "CANCELLED" && !cancelSaleTicketMutation.isPending;
  const confirmSucceeded =
    ticket.status === "CONFIRMED" && !confirmSaleTicketMutation.isPending;
  const voidSucceeded =
    ticket.status === "VOIDED" && !voidSaleTicketMutation.isPending;
  const pendingItemId =
    (updateSaleTicketItemMutation.variables &&
    "itemId" in updateSaleTicketItemMutation.variables
      ? updateSaleTicketItemMutation.variables.itemId
      : null) ??
    removeSaleTicketItemMutation.variables?.itemId ??
    null;
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <SaleTicketHeader
        ticket={ticket}
        onBack={onBack}
        criticalActions={
          !canEditDraft ? (
            <SaleTicketCriticalActions
              ticket={ticket}
              canMutateDraft={canEditDraft}
              canMutateVoid={Boolean(canVoid)}
              cancelError={cancelSaleTicketMutation.error}
              confirmError={
                !hasItems && !confirmSaleTicketMutation.error
                  ? "Agrega al menos un item al borrador antes de confirmar la venta."
                  : confirmSaleTicketMutation.error
              }
              voidError={voidSaleTicketMutation.error}
              isCancelPending={cancelSaleTicketMutation.isPending}
              isConfirmPending={confirmSaleTicketMutation.isPending}
              isVoidPending={voidSaleTicketMutation.isPending}
              cancelSuccess={cancelSucceeded}
              confirmSuccess={confirmSucceeded}
              voidSuccess={voidSucceeded}
              onCancel={async () => {
                await cancelSaleTicketMutation.mutateAsync({
                  reason: "Cancelado desde el panel de ventas.",
                  ...(ticket.version
                    ? { expectedVersion: ticket.version }
                    : {}),
                });
              }}
              onConfirm={async () => {
                if (!hasItems || !ticket.paymentMethod) {
                  return;
                }

                await confirmSaleTicketMutation.mutateAsync({
                  ...(ticket.version
                    ? { expectedVersion: ticket.version }
                    : {}),
                  paymentMethod: ticket.paymentMethod,
                  ...(ticket.paymentMethod === "TRANSFER" &&
                  ticket.paymentBankId
                    ? { paymentBankId: ticket.paymentBankId }
                    : {}),
                });
              }}
              onVoid={async (values) => {
                await voidSaleTicketMutation.mutateAsync({
                  ...values,
                  ...(ticket.version
                    ? { expectedVersion: ticket.version }
                    : {}),
                });
              }}
            />
          ) : null
        }
      />

      {canEditDraft ? (
        <>
          <SaleTicketPosWorkspace
            ticket={ticket}
            products={sellableProducts}
            catalogCategories={catalogCategories}
            remoteFiltering={posCatalogEnabled}
            hasMoreProducts={Boolean(posCatalogQuery.hasNextPage)}
            isLoadingMoreProducts={posCatalogQuery.isFetchingNextPage}
            onCatalogSearchChange={setCatalogSearch}
            onCatalogCategoryChange={setCatalogCategoryId}
            onLoadMoreProducts={() => void posCatalogQuery.fetchNextPage()}
            isProductsLoading={
              (posCatalogEnabled && posCatalogQuery.isLoading) ||
              productsQuery.isLoading ||
              inventoryQuery.isLoading ||
              categoriesQuery.isLoading
            }
            productsError={
              posCatalogQuery.error ??
              productsQuery.error ??
              inventoryQuery.error ??
              categoriesQuery.error
            }
            isAddingItem={addSaleTicketItemMutation.isPending}
            isUpdatingItem={updateSaleTicketItemMutation.isPending}
            isRemovingItem={removeSaleTicketItemMutation.isPending}
            paymentBanks={paymentBanksQuery.data ?? []}
            isPaymentBanksLoading={paymentBanksQuery.isLoading}
            paymentBanksError={paymentBanksQuery.error}
            isSavingPayment={updateSaleTicketMutation.isPending}
            savePaymentError={updateSaleTicketMutation.error}
            addError={addSaleTicketItemMutation.error}
            updateError={updateSaleTicketItemMutation.error}
            removeError={removeSaleTicketItemMutation.error}
            isCancelPending={cancelSaleTicketMutation.isPending}
            isConfirmPending={confirmSaleTicketMutation.isPending}
            cancelError={cancelSaleTicketMutation.error}
            confirmError={
              !hasItems && !confirmSaleTicketMutation.error
                ? "Agrega al menos un item al pedido antes de confirmar la venta."
                : confirmSaleTicketMutation.error
            }
            cancelSuccess={cancelSucceeded}
            confirmSuccess={confirmSucceeded}
            onAddItem={async (values) => {
              await addSaleTicketItemMutation.mutateAsync({
                ...values,
                ...(ticket.version ? { expectedVersion: ticket.version } : {}),
              });
            }}
            onUpdateItem={async (itemId, values) => {
              await updateSaleTicketItemMutation.mutateAsync({
                itemId,
                data: {
                  ...values,
                  ...(ticket.version
                    ? { expectedVersion: ticket.version }
                    : {}),
                },
              });
            }}
            onRemoveItem={async (itemId) => {
              await removeSaleTicketItemMutation.mutateAsync({
                itemId,
                expectedVersion: ticket.version,
              });
            }}
            onSavePayment={async (values: SaleTicketPaymentFormValues) => {
              await updateSaleTicketMutation.mutateAsync({
                ticketId,
                data: {
                  ...values,
                  ...(ticket.version
                    ? { expectedVersion: ticket.version }
                    : {}),
                },
              });
            }}
            onCancel={async () => {
              await cancelSaleTicketMutation.mutateAsync({
                reason: "Cancelado desde el panel de ventas.",
                ...(ticket.version ? { expectedVersion: ticket.version } : {}),
              });
            }}
            onConfirm={async (values: ConfirmSaleTicketInput) => {
              if (!hasItems) {
                return;
              }

              await confirmSaleTicketMutation.mutateAsync({
                ...values,
                ...(ticket.version ? { expectedVersion: ticket.version } : {}),
              });
            }}
          />
        </>
      ) : (
        <>
          <SaleTicketSummary
            ticket={ticket}
            canViewCosts={Boolean(canViewCosts)}
          />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle>Items del ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.items.length === 0 ? (
                  <EmptyState
                    title={isDraft ? "Borrador sin items" : "Sin items"}
                    message={
                      isDraft
                        ? "Agrega productos para completar la venta antes de confirmar la venta."
                        : "Este ticket no registra items para mostrar."
                    }
                    className="w-full max-w-none shadow-none"
                  />
                ) : (
                  <SaleTicketItemsTable
                    items={ticket.items}
                    canEdit={canEditDraft}
                    canViewCosts={Boolean(canViewCosts)}
                    isUpdatingItem={updateSaleTicketItemMutation.isPending}
                    updateError={updateSaleTicketItemMutation.error}
                    removeError={removeSaleTicketItemMutation.error}
                    pendingItemId={pendingItemId}
                    onUpdateItem={async (itemId, values) => {
                      await updateSaleTicketItemMutation.mutateAsync({
                        itemId,
                        data: { ...values, expectedVersion: ticket.version },
                      });
                    }}
                    onRemoveItem={async (itemId) => {
                      await removeSaleTicketItemMutation.mutateAsync({
                        itemId,
                        expectedVersion: ticket.version,
                      });
                    }}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de la venta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Esta venta ya no permite cambios de productos o cantidades.
                  </p>
                  <p>
                    Los importes mostrados corresponden al momento de cierre.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </section>
  );
}
