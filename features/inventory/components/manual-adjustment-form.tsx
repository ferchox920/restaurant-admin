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
import { manualAdjustmentOperationSchema } from "@/features/inventory/schemas/inventory-operation.schema";
import type { ManualAdjustmentFormValue } from "@/features/inventory/types/inventory.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type ManualAdjustmentFormValues = z.input<typeof manualAdjustmentOperationSchema>;

type ManualAdjustmentFormProps = {
  currentStock: string;
  isPending?: boolean;
  error?: unknown;
  successMessage?: string;
  onSubmit: (
    values: ManualAdjustmentFormValue & { reason: string }
  ) => Promise<void> | void;
};

export function ManualAdjustmentForm({
  currentStock,
  isPending = false,
  error,
  successMessage,
  onSubmit,
}: ManualAdjustmentFormProps) {
  const form = useForm<ManualAdjustmentFormValues>({
    resolver: zodResolver(manualAdjustmentOperationSchema),
    defaultValues: {
      newStock: "",
      reason: "",
    },
  });

  async function handleSubmit(values: ManualAdjustmentFormValues) {
    await onSubmit(values);
    form.reset({ newStock: "", reason: "" });
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Fijar stock actual</p>
        <p>Este valor reemplaza el stock actual del producto.</p>
        <p className="mt-2">Stock actual: {currentStock}</p>
      </div>
      <FieldError message={form.formState.errors.newStock?.message}>
        <Label htmlFor="manual-adjustment-stock">Nuevo stock solicitado</Label>
        <Input
          id="manual-adjustment-stock"
          inputMode="decimal"
          disabled={isPending}
          placeholder="Ej. 18"
          {...form.register("newStock")}
        />
      </FieldError>
      <FieldError message={form.formState.errors.reason?.message}>
        <Label htmlFor="manual-adjustment-reason">Motivo</Label>
        <Textarea
          id="manual-adjustment-reason"
          disabled={isPending}
          placeholder="Ej. Conteo fisico de cierre."
          {...form.register("reason")}
        />
      </FieldError>
      {error ? (
        <ErrorMessage
          title="No se pudo fijar el stock"
          messages={getApiErrorMessages(error)}
        />
      ) : null}
      {successMessage ? <InventoryOperationSuccess message={successMessage} /> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Fijar stock actual"}
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
