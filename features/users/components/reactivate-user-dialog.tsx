"use client";

import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import { Button } from "@/components/ui/button";
import type { User } from "@/features/users/types/user.types";

type ReactivateUserDialogProps = {
  user: User;
  isPending?: boolean;
  onConfirm: () => Promise<void> | void;
};

export function ReactivateUserDialog({
  user,
  isPending = false,
  onConfirm,
}: ReactivateUserDialogProps) {
  return (
    <ConfirmActionDialog
      trigger={
        <Button type="button" variant="secondary">
          Reactivar usuario
        </Button>
      }
      title="Reactivar usuario"
      description={`El usuario ${user.firstName} ${user.lastName} volvera a quedar habilitado para iniciar sesion.`}
      confirmLabel="Reactivar"
      isPending={isPending}
      onConfirm={onConfirm}
    />
  );
}
