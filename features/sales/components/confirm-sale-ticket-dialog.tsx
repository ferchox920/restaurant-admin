"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import { ErrorMessage } from "@/components/feedback/error-message";
import { SaleTicketActionSuccess } from "@/features/sales/components/sale-ticket-action-success";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type ConfirmSaleTicketDialogProps = {
  itemsCount: number;
  isPending?: boolean;
  error?: unknown;
  success?: boolean;
  onConfirm: () => Promise<void> | void;
};

export function ConfirmSaleTicketDialog({
  itemsCount,
  isPending = false,
  error,
  success = false,
  onConfirm,
}: ConfirmSaleTicketDialogProps) {
  const isDisabled = isPending || itemsCount === 0;

  return (
    <div className="space-y-3">
      <ConfirmActionDialog
        trigger={
          <Button type="button" disabled={isDisabled}>
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
        <ErrorMessage
          title="Ticket vacio"
          messages="Agrega al menos un item al borrador antes de confirmar la venta."
        />
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
