"use client";

import Link from "next/link";
import { Eye, Pencil, Power, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import type { Product } from "@/features/products/types/product.types";

type ProductActionsProps = {
  product: Product;
  canMutate: boolean;
  onEdit: (product: Product) => void;
  onDeactivate: (product: Product) => Promise<void> | void;
  onReactivate: (product: Product) => Promise<void> | void;
  isDeactivatePending?: boolean;
  isReactivatePending?: boolean;
  showViewLink?: boolean;
};

export function ProductActions({
  product,
  canMutate,
  onEdit,
  onDeactivate,
  onReactivate,
  isDeactivatePending = false,
  isReactivatePending = false,
  showViewLink = true,
}: ProductActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      {showViewLink ? (
        <Button
          render={<Link href={`/products/${product.id}`} />}
          type="button"
          variant="outline"
          size="sm"
        >
          <Eye />
          Ver
        </Button>
      ) : null}

      {canMutate ? (
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(product)}
          >
            <Pencil />
            Editar
          </Button>

          {product.active ? (
            <ConfirmActionDialog
              trigger={
                <Button type="button" variant="destructive" size="sm">
                  <Power />
                  Desactivar
                </Button>
              }
              title="Desactivar producto"
              description={`El producto "${product.name}" dejara de estar disponible, pero no se eliminara.`}
              confirmLabel="Desactivar"
              confirmVariant="destructive"
              isPending={isDeactivatePending}
              onConfirm={() => onDeactivate(product)}
            />
          ) : (
            <ConfirmActionDialog
              trigger={
                <Button type="button" variant="secondary" size="sm">
                  <RotateCcw />
                  Reactivar
                </Button>
              }
              title="Reactivar producto"
              description={`El producto "${product.name}" volvera a quedar disponible.`}
              confirmLabel="Reactivar"
              isPending={isReactivatePending}
              onConfirm={() => onReactivate(product)}
            />
          )}
        </>
      ) : (
        <span className="text-sm text-muted-foreground">Solo lectura</span>
      )}
    </div>
  );
}
