"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/feedback/error-message";
import { updateTableOrderItemSchema } from "@/features/table-orders/schemas/table-order.schema";
import type { UpdateTableOrderItemFormValues } from "@/features/table-orders/types/table-order.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type Props = {
  productName: string;
  initialQuantity: string;
  isPending?: boolean;
  error?: unknown;
  onSubmit: (values: UpdateTableOrderItemFormValues) => Promise<void> | void;
};

export function UpdateTableOrderItemForm({
  productName,
  initialQuantity,
  isPending = false,
  error,
  onSubmit,
}: Props) {
  const [open, setOpen] = useState(false);
  const form = useForm<UpdateTableOrderItemFormValues>({
    resolver: zodResolver(updateTableOrderItemSchema),
    defaultValues: {
      quantity: initialQuantity,
    },
  });

  async function handleSubmit(values: UpdateTableOrderItemFormValues) {
    await onSubmit(values);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending && !nextOpen) {
          return;
        }

        setOpen(nextOpen);
        if (nextOpen) {
          form.reset({ quantity: initialQuantity });
        }
      }}
    >
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <Pencil aria-hidden="true" />
            Modificar
          </Button>
        }
      />
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>Modificar cantidad</DialogTitle>
          <DialogDescription>{productName}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="update-table-order-item-quantity">Cantidad</Label>
            <Input
              id="update-table-order-item-quantity"
              inputMode="decimal"
              disabled={isPending}
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
              title="No se pudo modificar la cantidad"
              messages={getApiErrorMessages(error)}
            />
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
