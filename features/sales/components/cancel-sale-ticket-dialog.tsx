"use client";

import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import { ErrorMessage } from "@/components/feedback/error-message";
import { SaleTicketActionSuccess } from "@/features/sales/components/sale-ticket-action-success";
import type { SaleTicketDetail } from "@/features/sales/types/sale-ticket.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type CancelSaleTicketDialogProps = {
  ticket: SaleTicketDetail;
  isPending?: boolean;
  error?: unknown;
  success?: boolean;
  onCancel: () => Promise<void> | void;
};

export function CancelSaleTicketDialog({
  isPending = false,
  error,
  success = false,
  onCancel,
}: CancelSaleTicketDialogProps) {
  return (
    <div className="space-y-3">
      <ConfirmActionDialog
        trigger={
          <Button type="button" variant="destructive">
            <Ban />
            Cancelar borrador
          </Button>
        }
        title="Cancelar borrador"
        description="La venta se descartara sin afectar stock ni caja."
        confirmLabel="Cancelar borrador"
        confirmVariant="destructive"
        isPending={isPending}
        onConfirm={onCancel}
      />

      {success ? (
        <SaleTicketActionSuccess message="La venta se cancelo correctamente." />
      ) : null}

      {error ? (
        <ErrorMessage
          title="No se pudo cancelar el borrador"
          messages={getApiErrorMessages(error)}
        />
      ) : null}
    </div>
  );
}
