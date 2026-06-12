"use client";

import { Pencil, Power, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import type { Category } from "@/features/categories/types/category.types";

type CategoryActionsProps = {
  category: Category;
  canMutate: boolean;
  onEdit: (category: Category) => void;
  onDeactivate: (category: Category) => Promise<void> | void;
  onReactivate: (category: Category) => Promise<void> | void;
  isDeactivatePending?: boolean;
  isReactivatePending?: boolean;
};

export function CategoryActions({
  category,
  canMutate,
  onEdit,
  onDeactivate,
  onReactivate,
  isDeactivatePending = false,
  isReactivatePending = false,
}: CategoryActionsProps) {
  if (!canMutate) {
    return <span className="text-sm text-muted-foreground">Solo lectura</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onEdit(category)}
      >
        <Pencil />
        Editar
      </Button>

      {category.active ? (
        <ConfirmActionDialog
          trigger={
            <Button type="button" variant="destructive" size="sm">
              <Power />
              Desactivar
            </Button>
          }
          title="Desactivar categoria"
          description={`La categoria "${category.name}" dejara de estar operativa, pero no se eliminara.`}
          confirmLabel="Desactivar"
          confirmVariant="destructive"
          isPending={isDeactivatePending}
          onConfirm={() => onDeactivate(category)}
        />
      ) : (
        <ConfirmActionDialog
          trigger={
            <Button type="button" variant="secondary" size="sm">
              <RotateCcw />
              Reactivar
            </Button>
          }
          title="Reactivar categoria"
          description={`La categoria "${category.name}" volvera a quedar disponible.`}
          confirmLabel="Reactivar"
          isPending={isReactivatePending}
          onConfirm={() => onReactivate(category)}
        />
      )}
    </div>
  );
}
