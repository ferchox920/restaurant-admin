"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Minus, Plus, Search, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { CancelTableOrderDialog } from "@/features/table-orders/components/cancel-table-order-dialog";
import { CloseTableOrderDialog } from "@/features/table-orders/components/close-table-order-dialog";
import type { PaymentBank } from "@/features/payment-banks/types/payment-bank.types";
import type { SaleProductOption } from "@/features/sales/types/sale-ticket.types";
import type {
  AddTableOrderItemFormValues,
  CancelTableOrderFormValues,
  CloseTableOrderFormValues,
  TableOrder,
  UpdateTableOrderItemFormValues,
} from "@/features/table-orders/types/table-order.types";
import {
  formatProductUnit,
  formatStockManagementType,
} from "@/lib/formatters";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { formatMoney } from "@/lib/money";

type TableOrderWorkspaceProps = {
  order: TableOrder;
  products: SaleProductOption[];
  isProductsLoading: boolean;
  productsError?: unknown;
  catalogCategories?: Array<{ id: string; name: string }>;
  remoteFiltering?: boolean;
  hasMoreProducts?: boolean;
  isLoadingMoreProducts?: boolean;
  onCatalogSearchChange?: (value: string) => void;
  onCatalogCategoryChange?: (categoryId?: string) => void;
  onLoadMoreProducts?: () => void;
  isAddingItem: boolean;
  isUpdatingItem: boolean;
  isRemovingItem: boolean;
  addError?: unknown;
  updateError?: unknown;
  removeError?: unknown;
  paymentBanks: PaymentBank[];
  isPaymentBanksLoading: boolean;
  isCancelPending: boolean;
  isClosePending: boolean;
  cancelError?: unknown;
  closeError?: unknown;
  onAddItem: (values: AddTableOrderItemFormValues) => Promise<void> | void;
  onUpdateItem: (
    itemId: string,
    values: UpdateTableOrderItemFormValues
  ) => Promise<void> | void;
  onRemoveItem: (itemId: string) => Promise<void> | void;
  onCancel: (values: CancelTableOrderFormValues) => Promise<void> | void;
  onClose: (values: CloseTableOrderFormValues) => Promise<void> | void;
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

export function TableOrderWorkspace({
  order,
  products,
  isProductsLoading,
  productsError,
  catalogCategories,
  remoteFiltering = false,
  hasMoreProducts = false,
  isLoadingMoreProducts = false,
  onCatalogSearchChange,
  onCatalogCategoryChange,
  onLoadMoreProducts,
  isAddingItem,
  isUpdatingItem,
  isRemovingItem,
  addError,
  updateError,
  removeError,
  paymentBanks,
  isPaymentBanksLoading,
  isCancelPending,
  isClosePending,
  cancelError,
  closeError,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onCancel,
  onClose,
}: TableOrderWorkspaceProps) {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [openPanel, setOpenPanel] = useState<"products" | "order">("products");
  const items = order.saleTicket.items;
  const lineByProductId = useMemo(
    () => new Map(items.map((item) => [item.productId, item])),
    [items]
  );
  const categories = useMemo(() => {
    if (catalogCategories) {
      return ["Todos", ...catalogCategories.map((category) => category.name)];
    }
    const names = new Set(products.map(getProductCategory));
    return ["Todos", ...Array.from(names).sort((a, b) => a.localeCompare(b))];
  }, [catalogCategories, products]);
  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = remoteFiltering ||
        selectedCategory === "Todos" ||
        getProductCategory(product) === selectedCategory;
      const matchesSearch =
        remoteFiltering || !normalizedSearch ||
        [product.name, product.sku ?? "", product.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [products, remoteFiltering, search, selectedCategory]);
  const isMutating =
    isAddingItem ||
    isUpdatingItem ||
    isRemovingItem ||
    isCancelPending ||
    isClosePending;

  async function incrementProduct(product: SaleProductOption) {
    const existingItem = lineByProductId.get(product.id);

    try {
      if (!existingItem) {
        await onAddItem({ productId: product.id, quantity: "1" });
        return;
      }

      await onUpdateItem(existingItem.id, {
        quantity: String(toNumber(existingItem.quantity) + 1),
      });
    } catch {
      return;
    }
  }

  async function decrementProduct(productId: string) {
    const existingItem = lineByProductId.get(productId);

    if (!existingItem) {
      return;
    }

    const nextQuantity = toNumber(existingItem.quantity) - 1;

    try {
      if (nextQuantity <= 0) {
        await onRemoveItem(existingItem.id);
        return;
      }

      await onUpdateItem(existingItem.id, {
        quantity: String(nextQuantity),
      });
    } catch {
      return;
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.75fr)] xl:items-start">
      <Card
        role="region"
        aria-label="Catálogo de productos"
        className="overflow-hidden border-muted/70 bg-gradient-to-br from-background via-background to-muted/30 shadow-sm xl:col-start-1 xl:row-start-1"
      >
        <CardHeader className="border-b bg-muted/20 p-0">
          <button
            type="button"
            className="flex w-full items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-muted/30 xl:pointer-events-none"
            aria-expanded={openPanel === "products"}
            onClick={() =>
              setOpenPanel((current) =>
                current === "products" ? "order" : "products"
              )
            }
          >
            <span>
              <CardTitle className="text-xl">Seleccionar productos</CardTitle>
              <span className="mt-1 block text-sm text-muted-foreground">
                Toca un producto para sumar consumos a la mesa.
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <Badge variant="outline" className="bg-background">
                {filteredProducts.length} productos
              </Badge>
              <ChevronDown
                aria-hidden="true"
                className={`size-4 transition-transform xl:hidden ${
                  openPanel === "products" ? "rotate-180" : ""
                }`}
              />
            </span>
          </button>
        </CardHeader>

          <CardContent
            className={`space-y-5 p-5 ${
              openPanel === "products" ? "" : "hidden xl:block"
            }`}
          >
            <div className="grid gap-3 rounded-2xl border bg-background/80 p-3 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,24rem)] lg:items-start">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={selectedCategory === category ? "default" : "ghost"}
                    size="sm"
                    aria-pressed={selectedCategory === category}
                    onClick={() => {
                      setSelectedCategory(category);
                      const selected = catalogCategories?.find(
                        (item) => item.name === category
                      );
                      onCatalogCategoryChange?.(selected?.id);
                    }}
                    className="shrink-0 rounded-full"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <div className="relative w-full">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    onCatalogSearchChange?.(event.target.value);
                  }}
                  aria-label="Buscar productos"
                  className="h-10 rounded-xl bg-muted/30 pr-9 pl-9"
                />
                {search ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 right-2 -translate-y-1/2"
                    aria-label="Limpiar búsqueda"
                    onClick={() => {
                      setSearch("");
                      onCatalogSearchChange?.("");
                    }}
                  >
                    <X aria-hidden="true" />
                  </Button>
                ) : null}
              </div>
            </div>

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
                message="No hay productos activos para cargar consumos."
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
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const item = lineByProductId.get(product.id);
                  const quantity = item ? formatQuantity(item.quantity) : "0";
                  const isSelected = Boolean(item);

                  return (
                    <div
                      key={product.id}
                      className="group flex min-h-40 flex-col justify-between rounded-2xl border bg-background p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md data-[selected=true]:border-primary data-[selected=true]:bg-primary/5 data-[selected=true]:shadow-md"
                      data-selected={isSelected}
                    >
                      <button
                        type="button"
                        className="min-h-20 text-left disabled:cursor-not-allowed"
                        disabled={isMutating}
                        onClick={() => {
                          void incrementProduct(product);
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="line-clamp-2 font-medium leading-5">
                              {product.name}
                            </p>
                            <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
                              {product.sku || getProductCategory(product)}
                            </p>
                          </div>
                          {isSelected ? <Badge>{quantity}</Badge> : null}
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                          {formatProductUnit(product.unit)}
                        </p>
                        <p className="mt-2 inline-flex rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                          {formatStockManagementType(
                            product.stockManagementType,
                          )}
                        </p>
                      </button>

                      <div className="mt-4 grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={!isSelected || isMutating}
                          onClick={() => {
                            void decrementProduct(product.id);
                          }}
                          aria-label={`Restar ${product.name}`}
                        >
                          <Minus aria-hidden="true" />
                        </Button>
                        <div className="rounded-xl bg-muted px-2 py-2 text-center text-sm font-semibold">
                          {quantity}
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          disabled={isMutating}
                          onClick={() => {
                            void incrementProduct(product);
                          }}
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
            {hasMoreProducts ? (
              <div className="flex justify-center pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoadingMoreProducts}
                  onClick={onLoadMoreProducts}
                >
                  {isLoadingMoreProducts ? "Cargando..." : "Cargar mas"}
                </Button>
              </div>
            ) : null}
          </CardContent>
      </Card>

      {addError || updateError || removeError ? (
        <div className="xl:col-span-2 xl:row-start-2">
          <ErrorMessage
            title="No se pudo actualizar la orden"
            messages={getApiErrorMessages(
              addError ?? updateError ?? removeError,
            )}
          />
        </div>
      ) : null}

      <Card
        role="region"
        aria-label="Consumos de la mesa"
        className="overflow-hidden border-muted/70 bg-gradient-to-br from-background via-background to-muted/30 shadow-sm xl:sticky xl:top-4 xl:col-start-2 xl:row-start-1 xl:max-h-[calc(100vh-2rem)]"
      >
        <CardHeader className="border-b bg-muted/20 p-0">
          <button
            type="button"
            className="flex w-full items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-muted/30 xl:pointer-events-none"
            aria-expanded={openPanel === "order"}
            onClick={() =>
              setOpenPanel((current) =>
                current === "order" ? "products" : "order"
              )
            }
          >
            <span>
              <CardTitle className="text-xl">Consumos de la mesa</CardTitle>
              <span className="mt-1 block text-sm text-muted-foreground">
                Mesa {order.tableCode}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <Badge variant="outline" className="bg-background">
                {items.length} items
              </Badge>
              <ChevronDown
                aria-hidden="true"
                className={`size-4 text-muted-foreground transition-transform xl:hidden ${
                  openPanel === "order" ? "rotate-180" : ""
                }`}
              />
            </span>
          </button>
        </CardHeader>

          <CardContent
            className={`space-y-5 p-5 xl:min-h-0 xl:overflow-y-auto ${
              openPanel === "order" ? "" : "hidden xl:block"
            }`}
          >
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
                Agrega productos desde la grilla para armar la orden de consumo.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border bg-background p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 font-medium">
                          {item.productNameSnapshot}
                        </p>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
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
                            return;
                          });
                        }}
                        aria-label={`Quitar ${item.productNameSnapshot}`}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                    <div className="mt-4 grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={isMutating}
                        onClick={() => {
                          void decrementProduct(item.productId);
                        }}
                        aria-label={`Restar ${item.productNameSnapshot}`}
                      >
                        <Minus aria-hidden="true" />
                      </Button>
                      <div className="rounded-xl bg-muted px-2 py-2 text-center text-sm font-semibold">
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
                            return;
                          });
                        }}
                        aria-label={`Sumar ${item.productNameSnapshot}`}
                      >
                        <Plus aria-hidden="true" />
                      </Button>
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatMoney(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-3 rounded-2xl border bg-background p-5 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatMoney(order.saleTicket.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xl font-semibold">
                  <span>Total</span>
                  <span>{formatMoney(order.saleTicket.total)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <CloseTableOrderDialog
                  itemsCount={items.length}
                  paymentBanks={paymentBanks}
                  isPaymentBanksLoading={isPaymentBanksLoading}
                  isPending={isClosePending}
                  error={closeError}
                  onClose={onClose}
                />
                <CancelTableOrderDialog
                  isPending={isCancelPending}
                  error={cancelError}
                  onCancel={onCancel}
                />
              </div>
            </div>
          </CardContent>
      </Card>
    </div>
  );
}
