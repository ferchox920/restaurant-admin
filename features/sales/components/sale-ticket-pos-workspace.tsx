"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/feedback/error-message";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { ConfirmSaleTicketDialog } from "@/features/sales/components/confirm-sale-ticket-dialog";
import { CancelSaleTicketDialog } from "@/features/sales/components/cancel-sale-ticket-dialog";
import type {
  AddSaleTicketItemFormValues,
  SaleProductOption,
  SaleTicketDetail,
  UpdateSaleTicketItemFormValues,
} from "@/features/sales/types/sale-ticket.types";
import { formatSaleTicketUnit } from "@/features/sales/utils/sale-ticket";
import { formatMoney } from "@/lib/money";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type SaleTicketPosWorkspaceProps = {
  ticket: SaleTicketDetail;
  products: SaleProductOption[];
  isProductsLoading: boolean;
  productsError?: unknown;
  isAddingItem: boolean;
  isUpdatingItem: boolean;
  isRemovingItem: boolean;
  addError?: unknown;
  updateError?: unknown;
  removeError?: unknown;
  isCancelPending: boolean;
  isConfirmPending: boolean;
  cancelError?: unknown;
  confirmError?: unknown;
  cancelSuccess: boolean;
  confirmSuccess: boolean;
  onAddItem: (values: AddSaleTicketItemFormValues) => Promise<void> | void;
  onUpdateItem: (
    itemId: string,
    values: UpdateSaleTicketItemFormValues
  ) => Promise<void> | void;
  onRemoveItem: (itemId: string) => Promise<void> | void;
  onCancel: () => Promise<void> | void;
  onConfirm: () => Promise<void> | void;
};

function toNumber(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatQuantity(value: string | number | null | undefined) {
  const parsed = toNumber(value);
  return Number.isInteger(parsed) ? String(parsed) : String(parsed);
}

function getProductCategory(product: SaleProductOption) {
  return product.categoryName?.trim() || "Sin categoria";
}

function getSaleBlockReason(product: SaleProductOption) {
  if (
    product.stockManagementType === "FINISHED_PRODUCT" &&
    product.stockStatus === "OUT_OF_STOCK"
  ) {
    return "Sin stock";
  }

  return null;
}

export function SaleTicketPosWorkspace({
  ticket,
  products,
  isProductsLoading,
  productsError,
  isAddingItem,
  isUpdatingItem,
  isRemovingItem,
  addError,
  updateError,
  removeError,
  isCancelPending,
  isConfirmPending,
  cancelError,
  confirmError,
  cancelSuccess,
  confirmSuccess,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onCancel,
  onConfirm,
}: SaleTicketPosWorkspaceProps) {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [blockedProductReasons, setBlockedProductReasons] = useState<
    Record<string, string>
  >({});

  const lineByProductId = useMemo(
    () => new Map(ticket.items.map((item) => [item.productId, item])),
    [ticket.items]
  );

  const categories = useMemo(() => {
    const names = new Set(products.map(getProductCategory));
    return ["Todos", ...Array.from(names).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "Todos" ||
        getProductCategory(product) === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        [product.name, product.sku ?? "", product.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [products, search, selectedCategory]);

  const isMutating =
    isAddingItem ||
    isUpdatingItem ||
    isRemovingItem ||
    isCancelPending ||
    isConfirmPending;

  function getRejectedSaleReason(error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "";

    if (/current cost/i.test(message)) {
      return "Sin costo vigente";
    }

    if (/current price/i.test(message)) {
      return "Sin precio final";
    }

    return null;
  }

  async function incrementProduct(product: SaleProductOption) {
    if (blockedProductReasons[product.id] ?? getSaleBlockReason(product)) {
      return;
    }

    const existingItem = lineByProductId.get(product.id);

    if (!existingItem) {
      try {
        await onAddItem({ productId: product.id, quantity: "1" });
        setBlockedProductReasons((current) => {
          if (!current[product.id]) {
            return current;
          }

          const next = { ...current };
          delete next[product.id];
          return next;
        });
      } catch (error) {
        const rejectedReason = getRejectedSaleReason(error);

        if (rejectedReason) {
          setBlockedProductReasons((current) => ({
            ...current,
            [product.id]: rejectedReason,
          }));
        }
      }
      return;
    }

    try {
      await onUpdateItem(existingItem.id, {
        quantity: String(toNumber(existingItem.quantity) + 1),
      });
    } catch {
      // Mutation state renders the error message; avoid an unhandled promise.
    }
  }

  async function decrementProduct(productId: string) {
    const existingItem = lineByProductId.get(productId);

    if (!existingItem) {
      return;
    }

    const nextQuantity = toNumber(existingItem.quantity) - 1;

    if (nextQuantity <= 0) {
      try {
        await onRemoveItem(existingItem.id);
      } catch {
        // Mutation state renders the error message; avoid an unhandled promise.
      }
      return;
    }

    try {
      await onUpdateItem(existingItem.id, {
        quantity: String(nextQuantity),
      });
    } catch {
      // Mutation state renders the error message; avoid an unhandled promise.
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="space-y-4">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Seleccionar productos</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Toca un producto para sumar unidades al pedido.
                </p>
              </div>
              <div className="relative w-full lg:max-w-xs">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar producto o SKU"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <Button
                  key={category}
                  type="button"
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="shrink-0"
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {isProductsLoading ? (
              <LoadingState
                title="Cargando productos"
                message="Estamos preparando el catalogo de venta."
                className="w-full max-w-none shadow-none"
              />
            ) : null}

            {productsError ? (
              <ErrorMessage
                title="No se pudieron cargar los productos"
                messages={getApiErrorMessages(productsError)}
              />
            ) : null}

            {!isProductsLoading && !productsError && products.length === 0 ? (
              <EmptyState
                title="Sin productos disponibles"
                message="No hay productos activos para vender en este momento."
                className="w-full max-w-none shadow-none"
              />
            ) : null}

            {!isProductsLoading &&
            !productsError &&
            products.length > 0 &&
            filteredProducts.length === 0 ? (
              <EmptyState
                title="Sin resultados"
                message="No encontramos productos con los filtros actuales."
                className="w-full max-w-none shadow-none"
              />
            ) : null}

            {filteredProducts.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {filteredProducts.map((product) => {
                  const item = lineByProductId.get(product.id);
                  const quantity = item ? formatQuantity(item.quantity) : "0";
                  const isSelected = Boolean(item);
                  const blockReason =
                    blockedProductReasons[product.id] ??
                    getSaleBlockReason(product);
                  const isBlocked = Boolean(blockReason);

                  return (
                    <div
                      key={product.id}
                      className="flex min-h-40 flex-col justify-between rounded-lg border bg-card p-3 transition-colors data-[blocked=true]:border-rose-200 data-[blocked=true]:bg-rose-50 data-[blocked=true]:text-rose-950 data-[selected=true]:border-primary data-[selected=true]:bg-muted/60"
                      data-selected={isSelected}
                      data-blocked={isBlocked}
                    >
                      <button
                        type="button"
                        className="min-h-20 text-left"
                        disabled={isMutating || isBlocked}
                        onClick={() => incrementProduct(product)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="line-clamp-2 font-medium leading-5">
                              {product.name}
                            </p>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {product.sku || getProductCategory(product)}
                            </p>
                          </div>
                          {isBlocked ? (
                            <Badge
                              variant="outline"
                              className="border-rose-200 bg-white text-rose-700"
                            >
                              No elegible
                            </Badge>
                          ) : isSelected ? (
                            <Badge variant="default">{quantity}</Badge>
                          ) : null}
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                          {formatSaleTicketUnit(product.unit)}
                        </p>
                        {blockReason ? (
                          <p className="mt-2 text-xs font-medium text-rose-700">
                            {blockReason}
                          </p>
                        ) : product.stockStatus === "LOW_STOCK" ? (
                          <p className="mt-2 text-xs font-medium text-amber-700">
                            Bajo stock
                          </p>
                        ) : null}
                      </button>

                      <div className="mt-3 grid grid-cols-[2rem_1fr_2rem] items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={!isSelected || isMutating}
                          onClick={() => decrementProduct(product.id)}
                          aria-label={`Restar ${product.name}`}
                        >
                          <Minus aria-hidden="true" />
                        </Button>
                        <div className="rounded-lg bg-muted px-2 py-1.5 text-center text-sm font-medium">
                          {quantity}
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          disabled={isMutating || isBlocked}
                          onClick={() => incrementProduct(product)}
                          aria-label={`Sumar ${product.name}`}
                        >
                          <Plus aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {addError || updateError || removeError ? (
          <ErrorMessage
            title="No se pudo actualizar el pedido"
            messages={getApiErrorMessages(addError ?? updateError ?? removeError)}
          />
        ) : null}
      </div>

      <aside className="xl:sticky xl:top-6 xl:self-start">
        <Card className="bg-card">
          <CardHeader className="gap-3">
            <CardTitle className="flex items-center justify-between gap-3">
              <span>Pedido</span>
              <Badge variant="outline">{ticket.items.length} items</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {ticket.salesChannel?.name ?? "Canal sin nombre"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticket.items.length === 0 ? (
              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                Agrega productos desde la grilla para armar el pedido.
              </div>
            ) : (
              <div className="max-h-[24rem] space-y-3 overflow-auto pr-1">
                {ticket.items.map((item) => (
                  <div key={item.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 font-medium">
                          {item.productNameSnapshot}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatMoney(item.unitPriceSnapshot)} c/u
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={isMutating}
                        onClick={() => {
                          void Promise.resolve(onRemoveItem(item.id)).catch(() => {
                            // Mutation state renders the error message.
                          });
                        }}
                        aria-label={`Quitar ${item.productNameSnapshot}`}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                    <div className="mt-3 grid grid-cols-[2rem_1fr_2rem] items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={isMutating}
                        onClick={() =>
                          decrementProduct(item.productId)
                        }
                        aria-label={`Restar ${item.productNameSnapshot}`}
                      >
                        <Minus aria-hidden="true" />
                      </Button>
                      <div className="rounded-lg bg-muted px-2 py-1.5 text-center text-sm font-medium">
                        {formatQuantity(item.quantity)}
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        disabled={isMutating}
                        onClick={() => {
                          void Promise.resolve(
                            onUpdateItem(item.id, {
                              quantity: String(toNumber(item.quantity) + 1),
                            })
                          ).catch(() => {
                            // Mutation state renders the error message.
                          });
                        }}
                        aria-label={`Sumar ${item.productNameSnapshot}`}
                      >
                        <Plus aria-hidden="true" />
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatMoney(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatMoney(ticket.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatMoney(ticket.total)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <ConfirmSaleTicketDialog
                itemsCount={ticket.items.length}
                isPending={isConfirmPending}
                error={confirmError}
                success={confirmSuccess}
                onConfirm={onConfirm}
              />
              <CancelSaleTicketDialog
                ticket={ticket}
                isPending={isCancelPending}
                error={cancelError}
                success={cancelSuccess}
                onCancel={onCancel}
              />
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
