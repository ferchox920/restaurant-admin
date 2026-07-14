"use client";

import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import { UpdateTableOrderItemForm } from "@/features/table-orders/components/update-table-order-item-form";
import type {
  TableOrderItem,
  UpdateTableOrderItemFormValues,
} from "@/features/table-orders/types/table-order.types";
import { formatMoney } from "@/lib/money";

type Props = {
  items: TableOrderItem[];
  canEdit: boolean;
  canViewCosts: boolean;
  isUpdatingItem: boolean;
  updateError?: unknown;
  removeError?: unknown;
  pendingItemId?: string | null;
  onUpdateItem: (
    itemId: string,
    values: UpdateTableOrderItemFormValues
  ) => Promise<void> | void;
  onRemoveItem: (itemId: string) => Promise<void> | void;
};

export function TableOrderItemsTable({
  items,
  canEdit,
  canViewCosts,
  isUpdatingItem,
  updateError,
  removeError,
  pendingItemId,
  onUpdateItem,
  onRemoveItem,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Unidad</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Precio unitario</TableHead>
            {canViewCosts ? <TableHead>Costo unitario</TableHead> : null}
            <TableHead>Subtotal</TableHead>
            {canEdit ? <TableHead className="text-right">Acciones</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isPending = pendingItemId === item.id;

            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.productNameSnapshot}</TableCell>
                <TableCell>{item.productSkuSnapshot || "-"}</TableCell>
                <TableCell>{item.productUnitSnapshot}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{formatMoney(item.unitPriceSnapshot)}</TableCell>
                {canViewCosts ? (
                  <TableCell>{formatMoney(item.unitCostSnapshot)}</TableCell>
                ) : null}
                <TableCell>{formatMoney(item.subtotal)}</TableCell>
                {canEdit ? (
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <UpdateTableOrderItemForm
                        productName={item.productNameSnapshot}
                        initialQuantity={item.quantity}
                        isPending={isUpdatingItem && isPending}
                        error={isPending ? updateError : undefined}
                        onSubmit={(values) => onUpdateItem(item.id, values)}
                      />
                      <ConfirmActionDialog
                        trigger={
                          <Button type="button" variant="destructive" size="sm">
                            <Trash2 aria-hidden="true" />
                            Quitar
                          </Button>
                        }
                        title="Quitar consumo"
                        description={`El consumo "${item.productNameSnapshot}" se quitara de la orden abierta.`}
                        confirmLabel="Quitar"
                        confirmVariant="destructive"
                        isPending={isPending}
                        onConfirm={() => onRemoveItem(item.id)}
                      />
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
          {canEdit && removeError ? (
            <TableRow>
              <TableCell colSpan={canViewCosts ? 8 : 7} className="text-sm text-destructive">
                No se pudo quitar el consumo. Revisa el estado de la orden.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
