"use client";

import Link from "next/link";
import { Pencil, Power, RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { User } from "@/features/users/types/user.types";
import { cn } from "@/lib/utils";

type UserActionsProps = {
  user: User;
  canMutate: boolean;
  onEdit?: (user: User) => void;
  onDeactivate?: (user: User) => void;
  onReactivate?: (user: User) => void;
  isDeactivatePending?: boolean;
  isReactivatePending?: boolean;
  showViewLink?: boolean;
};

export function UserActions({
  user,
  canMutate,
  onEdit,
  onDeactivate,
  onReactivate,
  isDeactivatePending = false,
  isReactivatePending = false,
  showViewLink = true,
}: UserActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {showViewLink ? (
        <Link
          href={`/users/${user.id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Ver detalle
        </Link>
      ) : null}

      {canMutate && onEdit ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(user)}>
          <Pencil aria-hidden="true" />
          Editar
        </Button>
      ) : null}

      {canMutate && user.active && onDeactivate ? (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={isDeactivatePending}
          onClick={() => onDeactivate(user)}
        >
          <Power aria-hidden="true" />
          {isDeactivatePending ? "Desactivando..." : "Desactivar"}
        </Button>
      ) : null}

      {canMutate && !user.active && onReactivate ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isReactivatePending}
          onClick={() => onReactivate(user)}
        >
          <RotateCcw aria-hidden="true" />
          {isReactivatePending ? "Reactivando..." : "Reactivar"}
        </Button>
      ) : null}
    </div>
  );
}
