"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorMessage } from "@/components/feedback/error-message";
import { EmptyState } from "@/components/feedback/empty-state";
import { ForbiddenState } from "@/components/feedback/forbidden-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { SaleTicketHeader } from "@/features/sales/components/sale-ticket-header";
import { SaleTicketCriticalActions } from "@/features/sales/components/sale-ticket-critical-actions";
import { SaleTicketItemsTable } from "@/features/sales/components/sale-ticket-items-table";
import { SaleTicketSummary } from "@/features/sales/components/sale-ticket-summary";
import { SaleTicketPosWorkspace } from "@/features/sales/components/sale-ticket-pos-workspace";
import { SalesChannelSelector } from "@/features/sales/components/sales-channel-selector";
import { updateSaleTicketSchema } from "@/features/sales/schemas/sale-ticket.schema";
import { useAddSaleTicketItem } from "@/features/sales/hooks/use-add-sale-ticket-item";
import { useCancelSaleTicket } from "@/features/sales/hooks/use-cancel-sale-ticket";
import { useConfirmSaleTicket } from "@/features/sales/hooks/use-confirm-sale-ticket";
import { useRemoveSaleTicketItem } from "@/features/sales/hooks/use-remove-sale-ticket-item";
import { useSaleTicket } from "@/features/sales/hooks/use-sale-ticket";
import { useUpdateSaleTicket } from "@/features/sales/hooks/use-update-sale-ticket";
import { useUpdateSaleTicketItem } from "@/features/sales/hooks/use-update-sale-ticket-item";
import { useVoidSaleTicket } from "@/features/sales/hooks/use-void-sale-ticket";
import type {
  SaleProductOption,
  UpdateSaleTicketFormValues,
} from "@/features/sales/types/sale-ticket.types";
import { canEditTicket } from "@/features/sales/utils/sale-ticket";
import { useProducts } from "@/features/products/hooks/use-products";
import { useInventory } from "@/features/inventory/hooks/use-inventory";
import { useSalesChannels } from "@/features/sales-channels/hooks/use-sales-channels";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";
import { isNotFoundError } from "@/lib/api/query-utils";

type SaleTicketPageProps = {
  ticketId: string;
  onBack?: () => void;
};

export function SaleTicketPage({ ticketId, onBack }: SaleTicketPageProps) {
  const { user } = useAuth();
  const canMutateDraft =
    user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "CASHIER";
  const canVoid =
    user?.role === "ADMIN" || user?.role === "MANAGER";
  const canViewCosts =
    user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "AUDITOR";

  const saleTicketQuery = useSaleTicket(ticketId);
  const salesChannelsQuery = useSalesChannels({ active: true });
  const productsQuery = useProducts({ active: true });
  const inventoryQuery = useInventory({ active: true });

  const updateSaleTicketMutation = useUpdateSaleTicket();
  const cancelSaleTicketMutation = useCancelSaleTicket(ticketId);
  const confirmSaleTicketMutation = useConfirmSaleTicket(ticketId);
  const voidSaleTicketMutation = useVoidSaleTicket(ticketId);
  const addSaleTicketItemMutation = useAddSaleTicketItem(ticketId);
  const updateSaleTicketItemMutation = useUpdateSaleTicketItem(ticketId);
  const removeSaleTicketItemMutation = useRemoveSaleTicketItem(ticketId);

  const form = useForm<UpdateSaleTicketFormValues>({
    resolver: zodResolver(updateSaleTicketSchema),
    defaultValues: {
      salesChannelId: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!saleTicketQuery.data) {
      return;
    }

    form.reset({
      salesChannelId: saleTicketQuery.data.salesChannelId,
      notes: saleTicketQuery.data.notes ?? "",
    });
  }, [form, saleTicketQuery.data]);

  const activeChannels = useMemo(
    () =>
      (salesChannelsQuery.data ?? [])
        .filter((channel) => channel.active)
        .map((channel) => ({
          id: channel.id,
          name: channel.name,
          active: channel.active,
        })),
    [salesChannelsQuery.data]
  );

  const sellableProducts = useMemo<SaleProductOption[]>(
    () => {
      const inventoryByProductId = new Map(
        (inventoryQuery.data ?? []).map((item) => [item.productId, item])
      );

      return (productsQuery.data ?? [])
        .filter(
          (product) => product.active && product.stockManagementType !== "RECIPE_BASED"
        )
        .map((product) => {
          const inventory = inventoryByProductId.get(product.id);

          return {
            id: product.id,
            name: product.name,
            description: product.description,
            sku: product.sku,
            categoryId: product.categoryId,
            categoryName: product.category?.name ?? null,
            unit: product.unit,
            stockManagementType: product.stockManagementType,
            stockStatus: inventory?.stockStatus,
            currentStock: inventory?.currentStock ?? null,
            active: product.active,
          };
        });
    },
    [inventoryQuery.data, productsQuery.data]
  );

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
          title={isNotFound ? "Ticket no encontrado" : "No se pudo cargar el ticket"}
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
  const cancelSucceeded = ticket.status === "CANCELLED" && !cancelSaleTicketMutation.isPending;
  const confirmSucceeded =
    ticket.status === "CONFIRMED" && !confirmSaleTicketMutation.isPending;
  const voidSucceeded = ticket.status === "VOIDED" && !voidSaleTicketMutation.isPending;
  const pendingItemId =
    (updateSaleTicketItemMutation.variables &&
    "itemId" in updateSaleTicketItemMutation.variables
      ? updateSaleTicketItemMutation.variables.itemId
      : null) ??
    removeSaleTicketItemMutation.variables ??
    null;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <SaleTicketHeader
        ticket={ticket}
        onBack={onBack}
        criticalActions={!canEditDraft ? (
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
              });
            }}
            onConfirm={async () => {
              if (!hasItems) {
                return;
              }

              await confirmSaleTicketMutation.mutateAsync(undefined);
            }}
            onVoid={async (values) => {
              await voidSaleTicketMutation.mutateAsync(values);
            }}
          />
        ) : null}
      />

      {canEditDraft ? (
        <>
          <Card>
            <CardContent className="space-y-4 pt-5">
              <form
                className="grid gap-4 lg:grid-cols-[minmax(18rem,1fr)_minmax(0,1.6fr)_auto]"
                onSubmit={form.handleSubmit(async (values) => {
                  await updateSaleTicketMutation.mutateAsync({
                    ticketId,
                    data: values,
                  });
                })}
              >
                <div className="space-y-2">
                  <Label>Canal</Label>
                  <Controller
                    control={form.control}
                    name="salesChannelId"
                    render={({ field }) => (
                      <SalesChannelSelector
                        channels={activeChannels}
                        selectedChannelId={field.value}
                        onChange={(value) => field.onChange(value ?? "")}
                      />
                    )}
                  />
                  {form.formState.errors.salesChannelId ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.salesChannelId.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sale-ticket-edit-notes">Notas</Label>
                  <Textarea
                    id="sale-ticket-edit-notes"
                    placeholder="Comentarios opcionales"
                    aria-invalid={Boolean(form.formState.errors.notes)}
                    className="min-h-10"
                    {...form.register("notes")}
                  />
                  {form.formState.errors.notes ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.notes.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-end">
                  <Button
                    type="submit"
                    disabled={updateSaleTicketMutation.isPending}
                    className="w-full"
                  >
                    {updateSaleTicketMutation.isPending
                      ? "Guardando..."
                      : "Guardar"}
                  </Button>
                </div>
              </form>

              {updateSaleTicketMutation.error ? (
                <ErrorMessage
                  title="No se pudo actualizar el borrador"
                  messages={getApiErrorMessages(updateSaleTicketMutation.error)}
                />
              ) : null}
            </CardContent>
          </Card>

          <SaleTicketPosWorkspace
            ticket={ticket}
            products={sellableProducts}
            isProductsLoading={productsQuery.isLoading || inventoryQuery.isLoading}
            productsError={productsQuery.error ?? inventoryQuery.error}
            isAddingItem={addSaleTicketItemMutation.isPending}
            isUpdatingItem={updateSaleTicketItemMutation.isPending}
            isRemovingItem={removeSaleTicketItemMutation.isPending}
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
              await addSaleTicketItemMutation.mutateAsync(values);
            }}
            onUpdateItem={async (itemId, values) => {
              await updateSaleTicketItemMutation.mutateAsync({
                itemId,
                data: values,
              });
            }}
            onRemoveItem={async (itemId) => {
              await removeSaleTicketItemMutation.mutateAsync(itemId);
            }}
            onCancel={async () => {
              await cancelSaleTicketMutation.mutateAsync({
                reason: "Cancelado desde el panel de ventas.",
              });
            }}
            onConfirm={async () => {
              if (!hasItems) {
                return;
              }

              await confirmSaleTicketMutation.mutateAsync(undefined);
            }}
          />
        </>
      ) : (
        <>
          <SaleTicketSummary ticket={ticket} canViewCosts={Boolean(canViewCosts)} />
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
                    data: values,
                  });
                }}
                onRemoveItem={async (itemId) => {
                  await removeSaleTicketItemMutation.mutateAsync(itemId);
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
              <p>Esta venta ya no permite cambios de productos o cantidades.</p>
              <p>Los importes mostrados corresponden al momento de cierre.</p>
            </div>
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </section>
  );
}
