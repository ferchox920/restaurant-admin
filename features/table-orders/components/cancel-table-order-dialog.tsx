"use client";

import { useRef, useState } from "react";
import { XCircle } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorMessage } from "@/components/feedback/error-message";
import { cancelTableOrderSchema } from "@/features/table-orders/schemas/table-order.schema";
import type { CancelTableOrderFormValues } from "@/features/table-orders/types/table-order.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type Props = {
  isPending?: boolean;
  error?: unknown;
  onCancel: (values: CancelTableOrderFormValues) => Promise<void> | void;
};

export function CancelTableOrderDialog({
  isPending = false,
  error,
  onCancel,
}: Props) {
  const submitting = useRef(false);
  const [open, setOpen] = useState(false);
  const form = useForm<CancelTableOrderFormValues>({
    resolver: zodResolver(cancelTableOrderSchema),
    defaultValues: { reason: "" },
  });

  async function handleSubmit(values: CancelTableOrderFormValues) {
    if (submitting.current) return;
    submitting.current = true;
    try {
      await onCancel(values);
      setOpen(false);
    } catch {
      return;
    } finally {
      submitting.current = false;
    }
    form.reset({ reason: "" });
  }

  return (
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
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            disabled={isPending}
          >
            <XCircle aria-hidden="true" />
            Cancelar orden
          </Button>
        }
      />
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>Cancelar orden</DialogTitle>
          <DialogDescription>
            Descarta los consumos, no modifica el stock y vuelve a dejar
            disponible la mesa.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            void form.handleSubmit(handleSubmit)(event);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="cancel-table-order-reason">Motivo</Label>
            <Textarea
              id="cancel-table-order-reason"
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
              title="No se pudo cancelar la orden"
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
              Volver
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Cancelando..." : "Cancelar orden"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
