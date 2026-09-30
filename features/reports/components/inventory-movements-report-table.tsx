"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { MovementReference } from "@/features/inventory/components/movement-reference";
import { MovementTypeBadge } from "@/features/inventory/components/movement-type-badge";
import type { InventoryMovementReportItem } from "@/features/reports/types/report.types";
import { formatDateTime } from "@/lib/formatters";
import { canAccessRoute } from "@/lib/permissions/can-access-route";

export function InventoryMovementsReportTable({
  items,
}: {
  items: InventoryMovementReportItem[];
}) {
  const { user } = useAuth();
  const canOpenInventory = user
    ? canAccessRoute(user.role, "/inventory")
    : false;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Cantidad</TableHead>
          <TableHead>Stock anterior</TableHead>
          <TableHead>Stock nuevo</TableHead>
          <TableHead>Usuario</TableHead>
          <TableHead>Referencia</TableHead>
          <TableHead>Motivo</TableHead>
          <TableHead>Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.movementId}>
            <TableCell className="font-medium text-foreground">
              {canOpenInventory ? (
                <Link
                  href={`/inventory/${item.productId}`}
                  className="underline-offset-4 hover:underline"
                >
                  {item.productName}
                </Link>
              ) : (
                item.productName
              )}
            </TableCell>
            <TableCell>{item.productSku || "-"}</TableCell>
            <TableCell>
              <MovementTypeBadge movementType={item.movementType} />
            </TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell>{item.previousStock}</TableCell>
            <TableCell>{item.newStock}</TableCell>
            <TableCell>
              {item.createdByName ||
                item.createdByEmail ||
                item.createdById ||
                "-"}
            </TableCell>
            <TableCell>
              <MovementReference
                referenceType={item.referenceType}
                referenceId={item.referenceId}
              />
            </TableCell>
            <TableCell className="max-w-xs whitespace-normal">
              {item.reason}
            </TableCell>
            <TableCell>{formatDateTime(item.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
