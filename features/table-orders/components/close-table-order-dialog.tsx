"use client";

import { useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorMessage } from "@/components/feedback/error-message";
import { closeTableOrderSchema } from "@/features/table-orders/schemas/table-order.schema";
import type { CloseTableOrderFormValues } from "@/features/table-orders/types/table-order.types";
import type { PaymentBank } from "@/features/payment-banks/types/payment-bank.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type Props = {
  itemsCount: number;
  paymentBanks: PaymentBank[];
  isPaymentBanksLoading?: boolean;
  isPending?: boolean;
  error?: unknown;
  onClose: (values: CloseTableOrderFormValues) => Promise<void> | void;
};

export function CloseTableOrderDialog({
  itemsCount,
  paymentBanks,
  isPaymentBanksLoading = false,
  isPending = false,
  error,
  onClose,
}: Props) {
  const submitting = useRef(false);
  const [open, setOpen] = useState(false);
  const form = useForm<CloseTableOrderFormValues>({
    resolver: zodResolver(closeTableOrderSchema),
    defaultValues: { paymentMethod: "CASH", paymentBankId: "" },
  });
  const paymentMethod = useWatch({
    control: form.control,
    name: "paymentMethod",
  });
  const disabled = isPending || itemsCount === 0;

  async function handleSubmit(values: CloseTableOrderFormValues) {
    if (submitting.current) return;
    submitting.current = true;
    try {
      await onClose(values);
      setOpen(false);
    } catch {
      return;
    } finally {
      submitting.current = false;
    }
  }

  return (
    <div className="space-y-3">
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (isPending && !nextOpen) {
            return;
          }

          setOpen(nextOpen);
          if (nextOpen) {
            form.reset({ paymentMethod: "CASH", paymentBankId: "" });
          }
        }}
      >
        <DialogTrigger
          render={
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={disabled}
            >
              <CheckCircle2 aria-hidden="true" />
              Cerrar orden
            </Button>
          }
        />
        <DialogContent showCloseButton={!isPending}>
          <DialogHeader>
            <DialogTitle>Cerrar orden</DialogTitle>
            <DialogDescription>
              Confirma el cobro, actualiza el stock y vuelve a dejar disponible
              la mesa.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              void form.handleSubmit(handleSubmit)(event);
            }}
          >
            <div className="space-y-2">
              <Label>Método de pago</Label>
              <Controller
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    disabled={isPending}
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value === "CASH") {
                        form.setValue("paymentBankId", "");
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value) =>
                          value === "TRANSFER" ? "Transferencia" : "Efectivo"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Efectivo</SelectItem>
                      <SelectItem value="TRANSFER">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {paymentMethod === "TRANSFER" ? (
              <div className="space-y-2">
                <Label>Banco</Label>
                <Controller
                  control={form.control}
                  name="paymentBankId"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      disabled={isPaymentBanksLoading}
                    >
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={Boolean(
                          form.formState.errors.paymentBankId
                        )}
                      >
                        <SelectValue placeholder="Selecciona un banco" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentBanks.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.paymentBankId ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.paymentBankId.message}
                  </p>
                ) : null}
                {!isPaymentBanksLoading && paymentBanks.length === 0 ? (
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    No hay bancos activos para registrar una transferencia.
                  </p>
                ) : null}
              </div>
            ) : null}

            {error ? (
              <ErrorMessage
                title="No se pudo cerrar la orden"
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
              <Button type="submit" disabled={disabled}>
                {isPending ? "Cerrando..." : "Cerrar orden"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {itemsCount === 0 ? (
        <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          Agrega al menos un producto para habilitar el cierre.
        </p>
      ) : null}
    </div>
  );
}
