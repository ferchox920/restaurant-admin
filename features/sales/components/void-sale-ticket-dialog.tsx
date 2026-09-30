"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Undo2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorMessage } from "@/components/feedback/error-message";
import { SaleTicketActionSuccess } from "@/features/sales/components/sale-ticket-action-success";
import { voidSaleTicketSchema } from "@/features/sales/schemas/sale-ticket.schema";
import type {
  SaleTicketDetail,
  VoidSaleTicketFormValues,
} from "@/features/sales/types/sale-ticket.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type VoidSaleTicketDialogProps = {
  ticket: SaleTicketDetail;
  isPending?: boolean;
  error?: unknown;
  success?: boolean;
  onVoid: (values: VoidSaleTicketFormValues) => Promise<void> | void;
};

export function VoidSaleTicketDialog({
  ticket,
  isPending = false,
  error,
  success = false,
  onVoid,
}: VoidSaleTicketDialogProps) {
  const submitting = useRef(false);
  const [open, setOpen] = useState(false);
  const form = useForm<VoidSaleTicketFormValues>({
    resolver: zodResolver(voidSaleTicketSchema),
    defaultValues: {
      reason: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({ reason: "" });
    }
  }, [form, open]);

  return (
    <div className="space-y-3">
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (isPending && !nextOpen) {
            return;
          }

          setOpen(nextOpen);
        }}
      >
        <DialogTrigger
          render={
            <Button type="button" variant="secondary">
              <Undo2 />
              Anular venta confirmada
            </Button>
          }
        />
        <DialogContent className="sm:max-w-lg" showCloseButton={!isPending}>
          <DialogHeader>
            <DialogTitle>Anular venta confirmada</DialogTitle>
            <DialogDescription>
              La anulacion conserva la venta y restituye el stock de los
              productos inventariables mediante un movimiento de reversion.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              void form.handleSubmit(async (values) => {
                if (submitting.current) return;
                submitting.current = true;
                try {
                  await onVoid(values);
                  setOpen(false);
                } catch {
                  return;
                } finally {
                  submitting.current = false;
                }
              })(event);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="sale-ticket-void-reason">Motivo</Label>
              <Textarea
                id="sale-ticket-void-reason"
                placeholder={`Explica por que se anula la venta ${ticket.id}`}
                disabled={isPending}
                aria-invalid={Boolean(form.formState.errors.reason)}
                {...form.register("reason")}
              />
              {form.formState.errors.reason ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.reason.message}
                </p>
              ) : null}
            </div>

            {error ? (
              <ErrorMessage
                title="No se pudo anular la venta"
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
                {isPending ? "Anulando..." : "Confirmar anulacion"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {success ? (
        <SaleTicketActionSuccess message="La venta se anulo correctamente." />
      ) : null}
    </div>
  );
}
