"use client";

import { Controller, useForm } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorMessage } from "@/components/feedback/error-message";
import { addSaleTicketItemSchema } from "@/features/sales/schemas/sale-ticket.schema";
import type {
  AddSaleTicketItemFormValues,
  SaleProductOption,
} from "@/features/sales/types/sale-ticket.types";
import { formatProductUnit, formatStockManagementType } from "@/lib/formatters";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { toApiQuantityNumber } from "@/lib/quantity";

type AddSaleTicketItemFormProps = {
  products: SaleProductOption[];
  isPending?: boolean;
  error?: unknown;
  onSubmit: (values: AddSaleTicketItemFormValues) => Promise<void> | void;
};

export function AddSaleTicketItemForm({
  products,
  isPending = false,
  error,
  onSubmit,
}: AddSaleTicketItemFormProps) {
  const form = useForm<AddSaleTicketItemFormValues>({
    resolver: zodResolver(addSaleTicketItemSchema),
    defaultValues: {
      productId: "",
      quantity: "1",
    },
  });

  const selectedProductId = useWatch({
    control: form.control,
    name: "productId",
  });

  const selectedProduct = products.find(
    (product) => product.id === selectedProductId
  );
  const selectedProductRequiresStock =
    selectedProduct?.stockManagementType === "FINISHED_PRODUCT";
  const availableStock =
    !selectedProductRequiresStock || selectedProduct?.currentStock == null
      ? null
      : Number(selectedProduct.currentStock);
  const hasAvailableStock =
    !selectedProductRequiresStock ||
    (availableStock != null &&
      Number.isFinite(availableStock) &&
      availableStock > 0);
  const selectedStockLabel =
    !selectedProductRequiresStock
      ? "Sin control de stock"
      : selectedProduct?.currentStock == null
      ? "Stock no disponible"
      : `Stock disponible: ${selectedProduct.currentStock}`;

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        if (
          !selectedProduct ||
          (selectedProductRequiresStock &&
            (availableStock == null ||
              !Number.isFinite(availableStock) ||
              availableStock <= 0))
        ) {
          form.setError("quantity", {
            message: "El producto no tiene stock disponible para vender.",
          });
          return;
        }

        const requestedQuantity = toApiQuantityNumber(values.quantity);

        if (
          selectedProductRequiresStock &&
          availableStock != null &&
          requestedQuantity > availableStock
        ) {
          form.setError("quantity", {
            message: `Solo puedes agregar hasta ${selectedProduct.currentStock} unidades disponibles.`,
          });
          return;
        }

        await onSubmit(values);
        form.reset({
          productId: "",
          quantity: "1",
        });
      })}
    >
      <div className="space-y-2">
        <Label>Producto</Label>
        <Controller
          control={form.control}
          name="productId"
          render={({ field }) => (
            <Select
              value={field.value ?? ""}
              onValueChange={(value) => field.onChange(value || "")}
            >
              <SelectTrigger className="w-full" aria-invalid={Boolean(form.formState.errors.productId)}>
                <SelectValue placeholder="Selecciona un producto">
                  {(value) => {
                    const product = products.find((item) => item.id === value);

                    return product
                      ? `${product.name}${product.sku ? ` - ${product.sku}` : ""}`
                      : "Selecciona un producto";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                    {product.sku ? ` - ${product.sku}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.productId ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.productId.message}
          </p>
        ) : null}
        {selectedProduct ? (
          <p className="text-sm text-muted-foreground">
            {selectedProduct.sku || "Sin SKU"} · {formatProductUnit(selectedProduct.unit)} ·{" "}
            {formatStockManagementType(selectedProduct.stockManagementType)}
          </p>
        ) : null}
        {selectedProduct ? (
          <p className="text-sm font-medium text-muted-foreground">
            {selectedStockLabel}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sale-ticket-item-quantity">Cantidad</Label>
        <Input
          id="sale-ticket-item-quantity"
          inputMode="decimal"
          placeholder="1"
          max={
            selectedProductRequiresStock
              ? selectedProduct?.currentStock ?? undefined
              : undefined
          }
          aria-invalid={Boolean(form.formState.errors.quantity)}
          {...form.register("quantity")}
        />
        {form.formState.errors.quantity ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.quantity.message}
          </p>
        ) : null}
      </div>

      {error ? (
        <ErrorMessage
          title="No se pudo agregar el item"
          messages={getApiErrorMessages(error)}
        />
      ) : null}

      <Button
        type="submit"
        disabled={
          isPending ||
          products.length === 0 ||
          Boolean(selectedProduct && !hasAvailableStock)
        }
      >
        {isPending ? "Agregando..." : "Agregar item"}
      </Button>
    </form>
  );
}
