"use client";

import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/feedback/error-message";
import { InventoryOperationSuccess } from "@/features/inventory/components/inventory-operation-success";
import { updateMinimumStockOperationSchema } from "@/features/inventory/schemas/inventory-operation.schema";
import type { UpdateMinimumStockFormValue } from "@/features/inventory/types/inventory.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type MinimumStockFormValues = z.input<typeof updateMinimumStockOperationSchema>;

type MinimumStockFormProps = {
  currentMinimumStock: string;
  isPending?: boolean;
  error?: unknown;
  successMessage?: string;
  onSubmit: (values: UpdateMinimumStockFormValue) => Promise<void> | void;
};

export function MinimumStockForm({
  currentMinimumStock,
  isPending = false,
  error,
  successMessage,
  onSubmit,
}: MinimumStockFormProps) {
  const form = useForm<MinimumStockFormValues>({
    resolver: zodResolver(updateMinimumStockOperationSchema),
    defaultValues: {
      minimumStock: currentMinimumStock,
    },
  });

  async function handleSubmit(values: MinimumStockFormValues) {
    await onSubmit(values);
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
      <p className="text-sm text-muted-foreground">
        Actualizar stock minimo no modifica el stock actual del producto.
      </p>
      <FieldError message={form.formState.errors.minimumStock?.message}>
        <Label htmlFor="minimum-stock">Stock minimo</Label>
        <Input
          id="minimum-stock"
          inputMode="decimal"
          disabled={isPending}
          {...form.register("minimumStock")}
        />
      </FieldError>
      {error ? (
        <ErrorMessage
          title="No se pudo actualizar el stock minimo"
          messages={getApiErrorMessages(error)}
        />
      ) : null}
      {successMessage ? (
        <InventoryOperationSuccess message={successMessage} />
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Actualizar stock minimo"}
      </Button>
    </form>
  );
}

function FieldError({
  children,
  message,
}: {
  children: ReactNode;
  message?: string;
}) {
  return (
    <div className="space-y-2">
      {children}
      {message ? <p className="text-sm text-destructive">{message}</p> : null}
    </div>
  );
}
