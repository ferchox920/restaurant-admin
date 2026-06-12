"use client";

import type { ReactElement } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmActionDialogProps = {
  trigger: ReactElement;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
  confirmVariant?: "default" | "destructive";
  isPending?: boolean;
};

export function ConfirmActionDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  onConfirm,
  confirmVariant = "default",
  isPending = false,
}: ConfirmActionDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>
            {cancelLabel}
          </DialogClose>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={isPending}
            onClick={() => {
              void onConfirm?.();
            }}
            render={<button />}
          >
            {isPending ? "Procesando..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
