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
import { UpdateSaleTicketItemForm } from "@/features/sales/components/update-sale-ticket-item-form";
import type {
  SaleTicketItem,
  UpdateSaleTicketItemFormValues,
} from "@/features/sales/types/sale-ticket.types";
import { formatSaleTicketUnit } from "@/features/sales/utils/sale-ticket";
import { formatMoney } from "@/lib/money";

type SaleTicketItemsTableProps = {
  items: SaleTicketItem[];
  canEdit: boolean;
  canViewCosts: boolean;
  isUpdatingItem: boolean;
  updateError?: unknown;
  removeError?: unknown;
  pendingItemId?: string | null;
  onUpdateItem: (
    itemId: string,
    values: UpdateSaleTicketItemFormValues
  ) => Promise<void> | void;
  onRemoveItem: (itemId: string) => Promise<void> | void;
};

export function SaleTicketItemsTable({
  items,
  canEdit,
  canViewCosts,
  isUpdatingItem,
  updateError,
  removeError,
  pendingItemId,
  onUpdateItem,
  onRemoveItem,
}: SaleTicketItemsTableProps) {
  return (
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
          {canEdit ? (
            <TableHead className="text-right">Acciones</TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const isPending = pendingItemId === item.id;

          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium text-foreground">
                {item.productNameSnapshot}
              </TableCell>
              <TableCell>{item.productSkuSnapshot || "-"}</TableCell>
              <TableCell>
                {formatSaleTicketUnit(item.productUnitSnapshot)}
              </TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{formatMoney(item.unitPriceSnapshot)}</TableCell>
              {canViewCosts ? (
                <TableCell>
                  {item.unitCostSnapshot
                    ? formatMoney(item.unitCostSnapshot)
                    : "-"}
                </TableCell>
              ) : null}
              <TableCell>{formatMoney(item.subtotal)}</TableCell>
              {canEdit ? (
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <UpdateSaleTicketItemForm
                      productName={item.productNameSnapshot}
                      initialQuantity={item.quantity}
                      isPending={isUpdatingItem && isPending}
                      error={isPending ? updateError : undefined}
                      onSubmit={(values) => onUpdateItem(item.id, values)}
                    />
                    <ConfirmActionDialog
                      trigger={
                        <Button type="button" variant="destructive" size="sm">
                          <Trash2 />
                          Quitar
                        </Button>
                      }
                      title="Eliminar linea"
                      description={`La linea "${item.productNameSnapshot}" se quitara del borrador.`}
                      confirmLabel="Eliminar"
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
            <TableCell
              colSpan={canViewCosts ? 8 : 7}
              className="text-sm text-destructive"
            >
              No se pudo quitar una de las lineas. Revisa el estado del ticket e
              intenta nuevamente.
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  );
}
