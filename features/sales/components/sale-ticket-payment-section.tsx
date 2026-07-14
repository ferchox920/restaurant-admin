"use client";

import { CreditCard, Landmark, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import type { PaymentBank } from "@/features/payment-banks/types/payment-bank.types";
import type { SalePaymentMethod } from "@/features/sales/types/sale-ticket.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type SaleTicketPaymentSectionProps = {
  paymentMethod: SalePaymentMethod | "";
  paymentBankId: string;
  banks: PaymentBank[];
  isBanksLoading?: boolean;
  banksError?: unknown;
  isSaving?: boolean;
  saveError?: unknown;
  disabled?: boolean;
  onPaymentMethodChange: (paymentMethod: SalePaymentMethod) => void;
  onPaymentBankChange: (paymentBankId: string) => void;
  onSave: () => Promise<void> | void;
};

export function getSalePaymentMethodLabel(
  paymentMethod: SalePaymentMethod | null | undefined
) {
  if (paymentMethod === "CASH") {
    return "Efectivo";
  }

  if (paymentMethod === "TRANSFER") {
    return "Transferencia";
  }

  return "Sin definir";
}

export function SaleTicketPaymentSection({
  paymentMethod,
  paymentBankId,
  banks,
  isBanksLoading = false,
  banksError,
  isSaving = false,
  saveError,
  disabled = false,
  onPaymentMethodChange,
  onPaymentBankChange,
  onSave,
}: SaleTicketPaymentSectionProps) {
  const requiresBank = paymentMethod === "TRANSFER";
  const canSave =
    !disabled &&
    !isSaving &&
    Boolean(paymentMethod) &&
    (!requiresBank || Boolean(paymentBankId));

  return (
    <Card className="border-muted/70 shadow-sm">
      <CardHeader className="gap-2">
        <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-lg">
          <span className="flex items-center gap-2">
            <CreditCard aria-hidden="true" className="size-5" />
            Método de pago
          </span>
          <Badge variant={paymentMethod ? "default" : "outline"}>
            {getSalePaymentMethodLabel(paymentMethod || null)}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Defínelo antes de confirmar la venta.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={disabled || isSaving}
            data-selected={paymentMethod === "CASH"}
            className="rounded-2xl border bg-background p-4 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5"
            onClick={() => onPaymentMethodChange("CASH")}
          >
            <span className="flex items-center gap-2 font-medium">
              <Wallet aria-hidden="true" className="size-4" />
              Efectivo
            </span>
            <span className="mt-2 block text-sm text-muted-foreground">
              No requiere banco.
            </span>
          </button>

          <button
            type="button"
            disabled={disabled || isSaving}
            data-selected={paymentMethod === "TRANSFER"}
            className="rounded-2xl border bg-background p-4 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5"
            onClick={() => onPaymentMethodChange("TRANSFER")}
          >
            <span className="flex items-center gap-2 font-medium">
              <Landmark aria-hidden="true" className="size-4" />
              Transferencia
            </span>
            <span className="mt-2 block text-sm text-muted-foreground">
              Requiere elegir un banco activo.
            </span>
          </button>
        </div>

        {requiresBank ? (
          <div className="space-y-2">
            <Label>Banco</Label>
            {isBanksLoading ? (
              <LoadingState
                title="Cargando bancos"
                message="Estamos consultando los bancos activos."
                className="w-full max-w-none shadow-none"
              />
            ) : null}

            {banksError ? (
              <ErrorMessage
                title="No se pudieron cargar los bancos"
                messages={getApiErrorMessages(banksError)}
              />
            ) : null}

            {!isBanksLoading && !banksError && banks.length === 0 ? (
              <EmptyState
                title="Sin bancos activos"
                message="No hay bancos disponibles para registrar transferencias."
                className="w-full max-w-none shadow-none"
              />
            ) : null}

            {banks.length > 0 ? (
              <Select
                value={paymentBankId}
                onValueChange={(value) => onPaymentBankChange(value ?? "")}
                disabled={disabled || isSaving}
              >
                <SelectTrigger className="w-full" aria-invalid={!paymentBankId}>
                  <SelectValue placeholder="Selecciona un banco">
                    {(value) =>
                      banks.find((bank) => bank.id === value)?.name ??
                      "Selecciona un banco"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}

            {!paymentBankId ? (
              <p className="text-sm text-destructive">
                Selecciona un banco para confirmar con transferencia.
              </p>
            ) : null}
          </div>
        ) : null}

        {saveError ? (
          <ErrorMessage
            title="No se pudo guardar el metodo de pago"
            messages={getApiErrorMessages(saveError)}
          />
        ) : null}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          aria-label="Guardar metodo de pago en el borrador"
          disabled={!canSave}
          onClick={onSave}
        >
          {isSaving ? "Guardando..." : "Guardar en el borrador"}
        </Button>
      </CardContent>
    </Card>
  );
}
