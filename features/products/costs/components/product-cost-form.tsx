"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/feedback/error-message";
import { productCostSchema } from "@/features/products/costs/schemas/product-cost.schema";
import type { CreateProductCostInput } from "@/features/products/costs/types/product-cost.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type ProductCostFormValues = z.input<typeof productCostSchema>;
type ProductCostFormSubmitValues = z.output<typeof productCostSchema>;

type ProductCostFormProps = {
  canSubmit: boolean;
  isPending?: boolean;
  error?: unknown;
  onSubmit: (values: CreateProductCostInput) => Promise<void> | void;
};

export function ProductCostForm({
  canSubmit,
  isPending = false,
  error,
  onSubmit,
}: ProductCostFormProps) {
  const form = useForm<ProductCostFormValues, undefined, ProductCostFormSubmitValues>({
    resolver: zodResolver(productCostSchema),
    defaultValues: {
      cost: "",
    },
  });

  useEffect(() => {
    if (!isPending) {
      form.setFocus("cost");
    }
  }, [form, isPending]);

  async function handleSubmit(values: ProductCostFormSubmitValues) {
    await onSubmit(values);
    form.reset({ cost: "" });
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="product-cost">Nuevo costo</Label>
        <Input
          id="product-cost"
          inputMode="decimal"
          placeholder="Ej. 3500.50"
          disabled={!canSubmit || isPending}
          aria-invalid={Boolean(form.formState.errors.cost)}
          {...form.register("cost")}
        />
        {form.formState.errors.cost ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.cost.message}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            El nuevo costo quedara vigente y reemplazara al costo anterior.
          </p>
        )}
      </div>

      {error ? (
        <ErrorMessage
          title="No se pudo crear la nueva version"
          messages={getApiErrorMessages(error)}
        />
      ) : null}

      <Button type="submit" disabled={!canSubmit || isPending}>
        {isPending ? "Guardando..." : "Crear nueva version"}
      </Button>
    </form>
  );
}
