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
import { returnInOperationSchema } from "@/features/inventory/schemas/inventory-operation.schema";
import type { InventoryQuantityFormValue } from "@/features/inventory/types/inventory.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type ReturnInFormValues = z.input<typeof returnInOperationSchema>;

type ReturnInFormProps = {
  isPending?: boolean;
  error?: unknown;
  successMessage?: string;
  onSubmit: (values: InventoryQuantityFormValue) => Promise<void> | void;
};

export function ReturnInForm({
  isPending = false,
  error,
  successMessage,
  onSubmit,
}: ReturnInFormProps) {
  const form = useForm<ReturnInFormValues>({
    resolver: zodResolver(returnInOperationSchema),
    defaultValues: {
      quantity: "",
      reason: "",
    },
  });

  async function handleSubmit(values: ReturnInFormValues) {
    await onSubmit(values);
    form.reset({ quantity: "", reason: "" });
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
      <p className="text-sm text-muted-foreground">
        Registrar reingreso suma nuevamente stock al producto.
      </p>
      <FieldError message={form.formState.errors.quantity?.message}>
        <Label htmlFor="return-in-quantity">Cantidad</Label>
        <Input
          id="return-in-quantity"
          inputMode="decimal"
          disabled={isPending}
          {...form.register("quantity")}
        />
      </FieldError>
      <FieldError message={form.formState.errors.reason?.message}>
        <Label htmlFor="return-in-reason">Motivo</Label>
        <Textarea
          id="return-in-reason"
          disabled={isPending}
          {...form.register("reason")}
        />
      </FieldError>
      {error ? (
        <ErrorMessage
          title="No se pudo registrar el reingreso"
          messages={getApiErrorMessages(error)}
        />
      ) : null}
      {successMessage ? <InventoryOperationSuccess message={successMessage} /> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Registrar reingreso"}
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
