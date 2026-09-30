"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
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
import { updateSaleTicketItemSchema } from "@/features/sales/schemas/sale-ticket.schema";
import type { UpdateSaleTicketItemFormValues } from "@/features/sales/types/sale-ticket.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type UpdateSaleTicketItemFormProps = {
  productName: string;
  initialQuantity: string;
  isPending?: boolean;
  error?: unknown;
  onSubmit: (values: UpdateSaleTicketItemFormValues) => Promise<void> | void;
};

export function UpdateSaleTicketItemForm({
  productName,
  initialQuantity,
  isPending = false,
  error,
  onSubmit,
}: UpdateSaleTicketItemFormProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<UpdateSaleTicketItemFormValues>({
    resolver: zodResolver(updateSaleTicketItemSchema),
    defaultValues: {
      quantity: initialQuantity,
    },
  });

  useEffect(() => {
    form.reset({
      quantity: initialQuantity,
    });
  }, [form, initialQuantity, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="ghost" size="sm">
            <Pencil aria-hidden="true" />
            Cantidad
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Actualizar cantidad</DialogTitle>
          <DialogDescription>
            Ajusta la cantidad del item &quot;{productName}&quot; dentro del
            borrador.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
            setOpen(false);
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="update-sale-ticket-item-quantity">Cantidad</Label>
            <Input
              id="update-sale-ticket-item-quantity"
              inputMode="decimal"
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
              title="No se pudo actualizar el item"
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
              {isPending ? "Guardando..." : "Guardar cantidad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
