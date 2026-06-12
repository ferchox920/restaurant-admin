"use client";

import { Pencil, Power, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import type { SalesChannel } from "@/features/sales-channels/types/sales-channel.types";

type SalesChannelActionsProps = {
  salesChannel: SalesChannel;
  canMutate: boolean;
  onEdit: (salesChannel: SalesChannel) => void;
  onDeactivate: (salesChannel: SalesChannel) => Promise<void> | void;
  onReactivate: (salesChannel: SalesChannel) => Promise<void> | void;
  isDeactivatePending?: boolean;
  isReactivatePending?: boolean;
};

export function SalesChannelActions({
  salesChannel,
  canMutate,
  onEdit,
  onDeactivate,
  onReactivate,
  isDeactivatePending = false,
  isReactivatePending = false,
}: SalesChannelActionsProps) {
  if (!canMutate) {
    return <span className="text-sm text-muted-foreground">Solo lectura</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onEdit(salesChannel)}
      >
        <Pencil />
        Editar
      </Button>

      {salesChannel.active ? (
        <ConfirmActionDialog
          trigger={
            <Button type="button" variant="destructive" size="sm">
              <Power />
              Desactivar
            </Button>
          }
          title="Desactivar canal"
          description={`El canal "${salesChannel.name}" dejara de estar disponible, sin borrarse del sistema.`}
          confirmLabel="Desactivar"
          confirmVariant="destructive"
          isPending={isDeactivatePending}
          onConfirm={() => onDeactivate(salesChannel)}
        />
      ) : (
        <ConfirmActionDialog
          trigger={
            <Button type="button" variant="secondary" size="sm">
              <RotateCcw />
              Reactivar
            </Button>
          }
          title="Reactivar canal"
          description={`El canal "${salesChannel.name}" volvera a quedar operativo.`}
          confirmLabel="Reactivar"
          isPending={isReactivatePending}
          onConfirm={() => onReactivate(salesChannel)}
        />
      )}
    </div>
  );
}
