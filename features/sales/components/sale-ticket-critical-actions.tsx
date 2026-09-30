"use client";

import type {
  SaleTicketDetail,
  VoidSaleTicketFormValues,
} from "@/features/sales/types/sale-ticket.types";
import {
  canCancelTicket,
  canConfirmTicket,
  canVoidTicket,
} from "@/features/sales/utils/sale-ticket";
import { CancelSaleTicketDialog } from "@/features/sales/components/cancel-sale-ticket-dialog";
import { ConfirmSaleTicketDialog } from "@/features/sales/components/confirm-sale-ticket-dialog";
import { VoidSaleTicketDialog } from "@/features/sales/components/void-sale-ticket-dialog";

type SaleTicketCriticalActionsProps = {
  ticket: SaleTicketDetail;
  canMutateDraft: boolean;
  canMutateVoid: boolean;
  cancelError?: unknown;
  confirmError?: unknown;
  voidError?: unknown;
  isCancelPending?: boolean;
  isConfirmPending?: boolean;
  isVoidPending?: boolean;
  cancelSuccess?: boolean;
  confirmSuccess?: boolean;
  voidSuccess?: boolean;
  onCancel: () => Promise<void> | void;
  onConfirm: () => Promise<void> | void;
  onVoid: (values: VoidSaleTicketFormValues) => Promise<void> | void;
};

export function SaleTicketCriticalActions({
  ticket,
  canMutateDraft,
  canMutateVoid,
  cancelError,
  confirmError,
  voidError,
  isCancelPending = false,
  isConfirmPending = false,
  isVoidPending = false,
  cancelSuccess = false,
  confirmSuccess = false,
  voidSuccess = false,
  onCancel,
  onConfirm,
  onVoid,
}: SaleTicketCriticalActionsProps) {
  const shouldShowCancel = canMutateDraft && canCancelTicket(ticket);
  const shouldShowConfirm = canMutateDraft && canConfirmTicket(ticket);
  const shouldShowVoid = canMutateVoid && canVoidTicket(ticket);

  if (!shouldShowCancel && !shouldShowConfirm && !shouldShowVoid) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {shouldShowCancel ? (
        <CancelSaleTicketDialog
          ticket={ticket}
          isPending={isCancelPending}
          error={cancelError}
          success={cancelSuccess}
          onCancel={onCancel}
        />
      ) : null}

      {shouldShowConfirm ? (
        <ConfirmSaleTicketDialog
          itemsCount={ticket.items.length}
          isPending={isConfirmPending}
          error={confirmError}
          success={confirmSuccess}
          onConfirm={onConfirm}
        />
      ) : null}

      {shouldShowVoid ? (
        <VoidSaleTicketDialog
          ticket={ticket}
          isPending={isVoidPending}
          error={voidError}
          success={voidSuccess}
          onVoid={onVoid}
        />
      ) : null}
    </div>
  );
}
