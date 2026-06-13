"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorMessage } from "@/components/feedback/error-message";
import type { Category } from "@/features/categories/types/category.types";
import { productSchema } from "@/features/products/schemas/product.schema";
import {
  productUnits,
  stockManagementTypes,
  type CreateProductInput,
} from "@/features/products/types/product.types";
import {
  formatProductUnit,
  formatStockManagementType,
} from "@/lib/formatters";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";

type ProductFormValues = z.input<typeof productSchema>;
type ProductFormSubmitValues = z.output<typeof productSchema>;

type ProductFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  categories: Category[];
  initialValues?: Partial<CreateProductInput>;
  isPending?: boolean;
  error?: unknown;
  onSubmit: (values: ProductFormSubmitValues) => Promise<void> | void;
};

export function ProductForm({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  categories,
  initialValues,
  isPending = false,
  error,
  onSubmit,
}: ProductFormProps) {
  const form = useForm<ProductFormValues, undefined, ProductFormSubmitValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      sku: initialValues?.sku ?? "",
      categoryId: initialValues?.categoryId ?? "",
      unit: initialValues?.unit ?? "UNIT",
      stockManagementType: initialValues?.stockManagementType ?? "NON_STOCKED",
    },
  });

  useEffect(() => {
    form.reset({
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      sku: initialValues?.sku ?? "",
      categoryId: initialValues?.categoryId ?? "",
      unit: initialValues?.unit ?? "UNIT",
      stockManagementType: initialValues?.stockManagementType ?? "NON_STOCKED",
    });
  }, [form, initialValues, open]);

  const errorTitle =
    error && isApiError(error) && error.statusCode === HTTP_STATUS.conflict
      ? "Conflicto al guardar el producto"
      : "No se pudo guardar el producto";

  async function handleSubmit(values: ProductFormSubmitValues) {
    await onSubmit(values);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending && !nextOpen) {
          return;
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-xl" showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="product-name">Nombre</Label>
            <Input
              id="product-name"
              placeholder="Ej. Latte grande"
              disabled={isPending}
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-sku">SKU</Label>
              <Input
              id="product-sku"
              placeholder="SKU opcional"
              disabled={isPending}
              aria-invalid={Boolean(form.formState.errors.sku)}
              {...form.register("sku")}
              />
              {form.formState.errors.sku ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.sku.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Controller
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    value={field.value || "__none__"}
                    onValueChange={(value) =>
                      field.onChange(value === "__none__" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una categoria">
                        {(value) => {
                          if (!value || value === "__none__") {
                            return "Sin categoria";
                          }

                          const category = categories.find(
                            (item) => item.id === value
                          );

                          return category
                            ? `${category.name}${!category.active ? " (inactiva)" : ""}`
                            : "Selecciona una categoria";
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Sin categoria</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                          {!category.active ? " (inactiva)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.categoryId ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.categoryId.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Unidad</Label>
              <Controller
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una unidad">
                        {(value) =>
                          value ? formatProductUnit(value) : "Selecciona una unidad"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {productUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {formatProductUnit(unit)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.unit ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.unit.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Tipo de stock</Label>
              <Controller
                control={form.control}
                name="stockManagementType"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un tipo">
                        {(value) =>
                          value
                            ? formatStockManagementType(value)
                            : "Selecciona un tipo"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {stockManagementTypes.map((stockManagementType) => (
                        <SelectItem
                          key={stockManagementType}
                          value={stockManagementType}
                        >
                          {formatStockManagementType(stockManagementType)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.stockManagementType ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.stockManagementType.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">Descripcion</Label>
            <Textarea
              id="product-description"
              placeholder="Descripcion operativa del producto"
              disabled={isPending}
              aria-invalid={Boolean(form.formState.errors.description)}
              {...form.register("description")}
            />
            {form.formState.errors.description ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

          {error ? (
            <ErrorMessage title={errorTitle} messages={getApiErrorMessages(error)} />
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
