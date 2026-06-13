"use client";

import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorMessage } from "@/components/feedback/error-message";
import { InventoryOperationSuccess } from "@/features/inventory/components/inventory-operation-success";
import { stockInOperationSchema } from "@/features/inventory/schemas/inventory-operation.schema";
import type { InventoryQuantityFormValue } from "@/features/inventory/types/inventory.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type StockInFormValues = z.input<typeof stockInOperationSchema>;

type StockInFormProps = {
  isPending?: boolean;
  error?: unknown;
  successMessage?: string;
  onSubmit: (values: InventoryQuantityFormValue) => Promise<void> | void;
};

export function StockInForm({
  isPending = false,
  error,
  successMessage,
  onSubmit,
}: StockInFormProps) {
  const form = useForm<StockInFormValues>({
    resolver: zodResolver(stockInOperationSchema),
    defaultValues: {
      quantity: "",
      reason: "",
    },
  });

  async function handleSubmit(values: StockInFormValues) {
    await onSubmit(values);
    form.reset({ quantity: "", reason: "" });
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
      <p className="text-sm text-muted-foreground">
        Ingresar stock suma la cantidad indicada al stock actual del producto.
      </p>
      <FieldError message={form.formState.errors.quantity?.message}>
        <Label htmlFor="stock-in-quantity">Cantidad</Label>
        <Input
          id="stock-in-quantity"
          inputMode="decimal"
          disabled={isPending}
          placeholder="Ej. 12.5"
          {...form.register("quantity")}
        />
      </FieldError>
      <FieldError message={form.formState.errors.reason?.message}>
        <Label htmlFor="stock-in-reason">Motivo</Label>
        <Textarea
          id="stock-in-reason"
          disabled={isPending}
          placeholder="Ej. Produccion terminada del turno."
          {...form.register("reason")}
        />
      </FieldError>
      {error ? (
        <ErrorMessage
          title="No se pudo ingresar stock"
          messages={getApiErrorMessages(error)}
        />
      ) : null}
      {successMessage ? <InventoryOperationSuccess message={successMessage} /> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Ingresar stock"}
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
