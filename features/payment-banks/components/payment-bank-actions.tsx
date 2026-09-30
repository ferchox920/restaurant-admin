"use client";

import { Pencil, Power, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import type { PaymentBank } from "@/features/payment-banks/types/payment-bank.types";

type PaymentBankActionsProps = {
  paymentBank: PaymentBank;
  canMutate: boolean;
  onEdit: (paymentBank: PaymentBank) => void;
  onDeactivate: (paymentBank: PaymentBank) => Promise<void> | void;
  onReactivate: (paymentBank: PaymentBank) => Promise<void> | void;
  isDeactivatePending?: boolean;
  isReactivatePending?: boolean;
};

export function PaymentBankActions({
  paymentBank,
  canMutate,
  onEdit,
  onDeactivate,
  onReactivate,
  isDeactivatePending = false,
  isReactivatePending = false,
}: PaymentBankActionsProps) {
  if (!canMutate) {
    return <span className="text-sm text-muted-foreground">Solo lectura</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onEdit(paymentBank)}
      >
        <Pencil aria-hidden="true" />
        Editar
      </Button>

      {paymentBank.active ? (
        <ConfirmActionDialog
          trigger={
            <Button type="button" variant="destructive" size="sm">
              <Power aria-hidden="true" />
              Desactivar
            </Button>
          }
          title="Desactivar banco"
          description={`El banco "${paymentBank.name}" dejara de estar disponible para registrar transferencias.`}
          confirmLabel="Desactivar"
          confirmVariant="destructive"
          isPending={isDeactivatePending}
          onConfirm={() => onDeactivate(paymentBank)}
        />
      ) : (
        <ConfirmActionDialog
          trigger={
            <Button type="button" variant="secondary" size="sm">
              <RotateCcw aria-hidden="true" />
              Reactivar
            </Button>
          }
          title="Reactivar banco"
          description={`El banco "${paymentBank.name}" volvera a quedar disponible para transferencias.`}
          confirmLabel="Reactivar"
          isPending={isReactivatePending}
          onConfirm={() => onReactivate(paymentBank)}
        />
      )}
    </div>
  );
}
