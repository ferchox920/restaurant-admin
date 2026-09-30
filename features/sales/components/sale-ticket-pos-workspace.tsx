"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Minus, Plus, Search, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/feedback/error-message";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { ConfirmSaleTicketDialog } from "@/features/sales/components/confirm-sale-ticket-dialog";
import { CancelSaleTicketDialog } from "@/features/sales/components/cancel-sale-ticket-dialog";
import { SaleTicketPaymentSection } from "@/features/sales/components/sale-ticket-payment-section";
import { saleTicketPaymentSchema } from "@/features/sales/schemas/sale-ticket.schema";
import type { PaymentBank } from "@/features/payment-banks/types/payment-bank.types";
import type {
  AddSaleTicketItemFormValues,
  ConfirmSaleTicketInput,
  SalePaymentMethod,
  SaleProductOption,
  SaleTicketDetail,
  SaleTicketPaymentFormValues,
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
  paymentBanks: PaymentBank[];
  isPaymentBanksLoading: boolean;
  paymentBanksError?: unknown;
  isSavingPayment: boolean;
  savePaymentError?: unknown;
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
  onSavePayment: (values: SaleTicketPaymentFormValues) => Promise<void> | void;
  onCancel: () => Promise<void> | void;
  onConfirm: (values: ConfirmSaleTicketInput) => Promise<void> | void;
};

function toNumber(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatQuantity(value: string | number | null | undefined) {
  const parsed = toNumber(value);
  return Number.isInteger(parsed) ? String(parsed) : String(parsed);
}

function requiresStock(product: SaleProductOption) {
  return product.stockManagementType === "FINISHED_PRODUCT";
}

function getAvailableStock(product: SaleProductOption) {
  if (!requiresStock(product)) {
    return null;
  }

  if (product.currentStock == null) {
    return null;
  }

  const stock = toNumber(product.currentStock);

  return stock > 0 ? stock : 0;
}

function getProductCategory(product: SaleProductOption) {
  return product.categoryName?.trim() || "Sin categoria";
}

function getSaleBlockReason(product: SaleProductOption) {
  if (!requiresStock(product)) {
    return null;
  }

  const availableStock = getAvailableStock(product);

  if (availableStock == null) {
    return "Stock no disponible";
  }

  if (availableStock <= 0 || product.stockStatus === "OUT_OF_STOCK") {
    return "Sin stock";
  }

  return null;
}

function getStockLimitReason(product: SaleProductOption, nextQuantity: number) {
  if (!requiresStock(product)) {
    return null;
  }

  const availableStock = getAvailableStock(product);

  if (availableStock == null) {
    return "Stock no disponible";
  }

  if (nextQuantity > availableStock) {
    return `Maximo disponible: ${formatQuantity(availableStock)}`;
  }

  return null;
}

export function SaleTicketPosWorkspace({
  ticket,
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
  paymentBanks,
  isPaymentBanksLoading,
  paymentBanksError,
  isSavingPayment,
  savePaymentError,
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
  onSavePayment,
  onCancel,
  onConfirm,
}: SaleTicketPosWorkspaceProps) {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [openPanel, setOpenPanel] = useState<"products" | "order">("products");
  const [paymentMethod, setPaymentMethod] = useState<SalePaymentMethod | "">(
    ticket.paymentMethod ?? ""
  );
  const [paymentBankId, setPaymentBankId] = useState(
    ticket.paymentBankId ?? ""
  );
  const [blockedProductReasons, setBlockedProductReasons] = useState<
    Record<string, string>
  >({});

  const lineByProductId = useMemo(
    () => new Map(ticket.items.map((item) => [item.productId, item])),
    [ticket.items]
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
      const matchesCategory =
        remoteFiltering ||
        selectedCategory === "Todos" ||
        getProductCategory(product) === selectedCategory;
      const matchesSearch =
        remoteFiltering ||
        !normalizedSearch ||
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
    isSavingPayment ||
    isCancelPending ||
    isConfirmPending;

  const paymentValidationResult = paymentMethod
    ? saleTicketPaymentSchema.safeParse({
        paymentMethod,
        paymentBankId,
      })
    : null;
  const paymentValidationMessage = !paymentMethod
    ? "Selecciona un metodo de pago antes de confirmar la venta."
    : paymentValidationResult && !paymentValidationResult.success
      ? (paymentValidationResult.error.issues[0]?.message ??
        "Completa el metodo de pago antes de confirmar la venta.")
      : null;

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
    const existingItem = lineByProductId.get(product.id);
    const currentQuantity = toNumber(existingItem?.quantity);
    const limitReason = getStockLimitReason(product, currentQuantity + 1);

    if (
      blockedProductReasons[product.id] ??
      getSaleBlockReason(product) ??
      limitReason
    ) {
      return;
    }

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

  async function handleSavePayment() {
    const result = saleTicketPaymentSchema.safeParse({
      paymentMethod,
      paymentBankId,
    });

    if (!result.success) {
      return;
    }

    await onSavePayment(result.data);
  }

  async function handleConfirm() {
    const result = saleTicketPaymentSchema.safeParse({
      paymentMethod,
      paymentBankId,
    });

    if (!result.success) {
      setOpenPanel("order");
      return;
    }

    await onConfirm(result.data);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.75fr)] xl:items-start">
      <Card className="overflow-hidden border-muted/70 bg-gradient-to-br from-background via-background to-muted/30 shadow-sm xl:col-start-1 xl:row-start-1">
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
                Toca un producto para sumar unidades al pedido.
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
                  className="shrink-0 rounded-full data-[selected=true]:shadow-sm"
                  data-selected={selectedCategory === category}
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
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const item = lineByProductId.get(product.id);
                const quantity = item ? formatQuantity(item.quantity) : "0";
                const numericQuantity = toNumber(item?.quantity);
                const isSelected = Boolean(item);
                const blockReason =
                  blockedProductReasons[product.id] ??
                  getSaleBlockReason(product);
                const limitReason = getStockLimitReason(
                  product,
                  numericQuantity + 1
                );
                const isBlocked = Boolean(blockReason);
                const isAtStockLimit = Boolean(limitReason);
                const stockLabel = !requiresStock(product)
                  ? "Sin control de stock"
                  : product.currentStock == null
                    ? "Stock no disponible"
                    : `Stock: ${formatQuantity(product.currentStock)}`;

                return (
                  <div
                    key={product.id}
                    className="group flex min-h-44 flex-col justify-between rounded-2xl border bg-background p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md data-[blocked=true]:border-rose-200 data-[blocked=true]:bg-rose-50 data-[blocked=true]:text-rose-950 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5 data-[selected=true]:shadow-md"
                    data-selected={isSelected}
                    data-blocked={isBlocked}
                  >
                    <button
                      type="button"
                      className="min-h-24 text-left disabled:cursor-not-allowed"
                      disabled={isMutating || isBlocked || isAtStockLimit}
                      onClick={() => incrementProduct(product)}
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
                      <p className="mt-2 inline-flex rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        {stockLabel}
                      </p>
                      {blockReason ? (
                        <p className="mt-2 text-xs font-medium text-rose-700">
                          {blockReason}
                        </p>
                      ) : limitReason ? (
                        <p className="mt-2 text-xs font-medium text-amber-700">
                          {limitReason}
                        </p>
                      ) : product.stockStatus === "LOW_STOCK" ? (
                        <p className="mt-2 text-xs font-medium text-amber-700">
                          Bajo stock
                        </p>
                      ) : null}
                    </button>

                    <div className="mt-4 grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2">
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
                      <div className="rounded-xl bg-muted px-2 py-2 text-center text-sm font-semibold">
                        {quantity}
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        disabled={isMutating || isBlocked || isAtStockLimit}
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
            title="No se pudo actualizar el pedido"
            messages={getApiErrorMessages(
              addError ?? updateError ?? removeError
            )}
          />
        </div>
      ) : null}

      <Card className="overflow-hidden border-muted/70 bg-gradient-to-br from-background via-background to-muted/30 shadow-sm xl:sticky xl:top-4 xl:col-start-2 xl:row-start-1 xl:max-h-[calc(100vh-2rem)]">
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
              <CardTitle className="text-xl">Pedido</CardTitle>
              <span className="mt-1 block text-sm text-muted-foreground">
                {ticket.salesChannel?.name ?? "Canal sin nombre"}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <Badge variant="outline" className="bg-background">
                {ticket.items.length} items
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
          {ticket.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
              Agrega productos desde la grilla para armar el pedido.
            </div>
          ) : (
            <div className="space-y-3">
              {ticket.items.map((item) => {
                const product = products.find(
                  (candidate) => candidate.id === item.productId
                );
                const limitReason = product
                  ? getStockLimitReason(product, toNumber(item.quantity) + 1)
                  : null;
                const stockLabel =
                  !product || !requiresStock(product)
                    ? "Sin control de stock"
                    : product.currentStock == null
                      ? "Stock no disponible"
                      : `Stock: ${formatQuantity(product.currentStock)}`;

                return (
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
                        <p className="mt-2 inline-flex rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                          {stockLabel}
                        </p>
                        {limitReason ? (
                          <p className="mt-1 text-xs font-medium text-amber-700">
                            {limitReason}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={isMutating}
                        onClick={() => {
                          void Promise.resolve(onRemoveItem(item.id)).catch(
                            () => {
                              // Mutation state renders the error message.
                            }
                          );
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
                        onClick={() => decrementProduct(item.productId)}
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
                        disabled={isMutating || Boolean(limitReason)}
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
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {formatMoney(item.subtotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-3 rounded-2xl border bg-background p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Resumen</p>
                <Badge variant="outline" className="bg-background">
                  {ticket.items.length}{" "}
                  {ticket.items.length === 1 ? "ítem" : "ítems"}
                </Badge>
              </div>
              <div className="border-t" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatMoney(ticket.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xl font-semibold">
                <span>Total</span>
                <span>{formatMoney(ticket.total)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <SaleTicketPaymentSection
                paymentMethod={paymentMethod}
                paymentBankId={paymentBankId}
                banks={paymentBanks}
                isBanksLoading={isPaymentBanksLoading}
                banksError={paymentBanksError}
                isSaving={isSavingPayment}
                saveError={savePaymentError}
                disabled={isConfirmPending}
                onPaymentMethodChange={(nextPaymentMethod) => {
                  setPaymentMethod(nextPaymentMethod);
                  if (nextPaymentMethod === "CASH") {
                    setPaymentBankId("");
                  }
                }}
                onPaymentBankChange={setPaymentBankId}
                onSave={handleSavePayment}
              />
              <ConfirmSaleTicketDialog
                itemsCount={ticket.items.length}
                disabledReason={paymentValidationMessage}
                isPending={isConfirmPending}
                error={confirmError}
                success={confirmSuccess}
                onConfirm={handleConfirm}
              />
              <CancelSaleTicketDialog
                ticket={ticket}
                isPending={isCancelPending}
                error={cancelError}
                success={cancelSuccess}
                onCancel={onCancel}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
