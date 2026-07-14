"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import { ErrorMessage } from "@/components/feedback/error-message";
import { SaleTicketActionSuccess } from "@/features/sales/components/sale-ticket-action-success";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type ConfirmSaleTicketDialogProps = {
  itemsCount: number;
  disabledReason?: string | null;
  isPending?: boolean;
  error?: unknown;
  success?: boolean;
  onConfirm: () => Promise<void> | void;
};

export function ConfirmSaleTicketDialog({
  itemsCount,
  disabledReason,
  isPending = false,
  error,
  success = false,
  onConfirm,
}: ConfirmSaleTicketDialogProps) {
  const isDisabled = isPending || itemsCount === 0 || Boolean(disabledReason);

  return (
    <div className="space-y-3">
      <ConfirmActionDialog
        trigger={
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={isDisabled}
          >
            <CheckCircle2 aria-hidden="true" />
            Confirmar venta
          </Button>
        }
        title="Confirmar venta"
        description="Confirma el cobro y descuenta stock de los productos inventariables."
        confirmLabel="Confirmar venta"
        isPending={isPending}
        onConfirm={onConfirm}
      />

      {itemsCount === 0 ? (
        <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          Agrega al menos un producto para habilitar la confirmación.
        </p>
      ) : null}

      {itemsCount > 0 && disabledReason ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          {disabledReason}
        </p>
      ) : null}

      {success ? (
        <SaleTicketActionSuccess message="La venta se confirmo correctamente." />
      ) : null}

      {error ? (
        <ErrorMessage
          title="No se pudo confirmar la venta"
          messages={getApiErrorMessages(error)}
        />
      ) : null}
    </div>
  );
}
