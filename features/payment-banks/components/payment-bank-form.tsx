"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorMessage } from "@/components/feedback/error-message";
import { paymentBankSchema } from "@/features/payment-banks/schemas/payment-bank.schema";
import type { CreatePaymentBankInput } from "@/features/payment-banks/types/payment-bank.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";

type PaymentBankFormValues = z.input<typeof paymentBankSchema>;
type PaymentBankFormSubmitValues = z.output<typeof paymentBankSchema>;

type PaymentBankFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  initialValues?: Partial<CreatePaymentBankInput>;
  isPending?: boolean;
  error?: unknown;
  onSubmit: (values: PaymentBankFormSubmitValues) => Promise<void> | void;
};

export function PaymentBankForm({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  initialValues,
  isPending = false,
  error,
  onSubmit,
}: PaymentBankFormProps) {
  const form = useForm<
    PaymentBankFormValues,
    undefined,
    PaymentBankFormSubmitValues
  >({
    resolver: zodResolver(paymentBankSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
    });
  }, [form, initialValues, open]);

  const errorTitle =
    error && isApiError(error) && error.statusCode === HTTP_STATUS.conflict
      ? "Conflicto al guardar el banco"
      : "No se pudo guardar el banco";

  async function handleSubmit(values: PaymentBankFormSubmitValues) {
    await onSubmit(values);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending && !nextOpen) {
          return;
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="payment-bank-name">Nombre</Label>
            <Input
              id="payment-bank-name"
              placeholder="Ej. Banco Galicia"
              disabled={isPending}
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-bank-description">Descripcion</Label>
            <Textarea
              id="payment-bank-description"
              placeholder="Datos internos opcionales para identificar el banco"
              disabled={isPending}
              aria-invalid={Boolean(form.formState.errors.description)}
              {...form.register("description")}
            />
            {form.formState.errors.description ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

          {error ? (
            <ErrorMessage
              variant="general"
              title={errorTitle}
              messages={getApiErrorMessages(error)}
            />
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
