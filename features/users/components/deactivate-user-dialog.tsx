"use client";

import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import { Button } from "@/components/ui/button";
import type { User } from "@/features/users/types/user.types";

type DeactivateUserDialogProps = {
  user: User;
  isSelf: boolean;
  isPending?: boolean;
  onConfirm: () => Promise<void> | void;
};

export function DeactivateUserDialog({
  user,
  isSelf,
  isPending = false,
  onConfirm,
}: DeactivateUserDialogProps) {
  const description = isSelf
    ? "Estas desactivando tu propia cuenta. Si el backend lo permite y no eres el ultimo ADMIN activo, dejaras de poder iniciar sesion."
    : `El usuario ${user.firstName} ${user.lastName} dejara de poder iniciar sesion hasta que sea reactivado.`;

  return (
    <ConfirmActionDialog
      trigger={
        <Button type="button" variant="destructive">
          Desactivar usuario
        </Button>
      }
      title="Desactivar usuario"
      description={description}
      confirmLabel="Desactivar"
      confirmVariant="destructive"
      isPending={isPending}
      onConfirm={onConfirm}
    />
  );
}
