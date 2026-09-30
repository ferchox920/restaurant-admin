"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { VersionCreatedMessage } from "@/components/feedback/version-created-message";
import { productCostSchema } from "@/features/products/costs/schemas/product-cost.schema";
import type {
  CreateProductCostInput,
  CurrentProductCost,
} from "@/features/products/costs/types/product-cost.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { formatMoney } from "@/lib/money";

type CreateCostVersionFormValues = z.input<typeof productCostSchema>;
type CreateCostVersionFormSubmitValues = z.output<typeof productCostSchema>;

type CreateCostVersionFormProps = {
  currentCost?: CurrentProductCost;
  canSubmit: boolean;
  isPending?: boolean;
  error?: unknown;
  successMessage?: string;
  onSubmit: (values: CreateProductCostInput) => Promise<void> | void;
};

export function CreateCostVersionForm({
  currentCost,
  canSubmit,
  isPending = false,
  error,
  successMessage,
  onSubmit,
}: CreateCostVersionFormProps) {
  const form = useForm<
    CreateCostVersionFormValues,
    undefined,
    CreateCostVersionFormSubmitValues
  >({
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

  async function handleSubmit(values: CreateCostVersionFormSubmitValues) {
    await onSubmit(values);
    form.reset({ cost: "" });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar costo</CardTitle>
      </CardHeader>
      <CardContent>
        {canSubmit ? (
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium text-muted-foreground">
                Costo actual
              </p>
              <p className="mt-2 text-lg font-semibold">
                {currentCost ? formatMoney(currentCost.cost) : "Sin costo"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-cost">Nuevo costo</Label>
              <Input
                id="product-cost"
                inputMode="decimal"
                placeholder="Ej. 3500.50"
                disabled={isPending}
                aria-invalid={Boolean(form.formState.errors.cost)}
                {...form.register("cost")}
              />
              {form.formState.errors.cost ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.cost.message}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Al guardar, este valor queda como costo vigente del producto.
                </p>
              )}
            </div>

            {error ? (
              <ErrorMessage
                title="No se pudo guardar el costo"
                messages={getApiErrorMessages(error)}
              />
            ) : null}

            {successMessage ? (
              <VersionCreatedMessage message={successMessage} />
            ) : null}

            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar costo"}
            </Button>
          </form>
        ) : (
          <EmptyState
            title="Solo lectura"
            message="Tu rol puede consultar costos vigentes e historial, pero no editar el costo."
            className="w-full max-w-none shadow-none"
          />
        )}
      </CardContent>
    </Card>
  );
}
