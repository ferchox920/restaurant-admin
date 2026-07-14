import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MovementReference } from "@/features/inventory/components/movement-reference";
import { MovementTypeBadge } from "@/features/inventory/components/movement-type-badge";
import type { InventoryMovement } from "@/features/inventory/types/inventory.types";
import { formatDateTime } from "@/lib/formatters";

export function InventoryMovementTable({
  movements,
}: {
  movements: InventoryMovement[];
}) {
  return (
    <Table className="min-w-[720px]">
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Variación</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead className="hidden xl:table-cell">Responsable</TableHead>
          <TableHead>Motivo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((movement) => (
          <TableRow key={movement.id}>
            <TableCell>{formatDateTime(movement.createdAt)}</TableCell>
            <TableCell>
              <MovementTypeBadge movementType={movement.movementType} />
              <div className="mt-1 text-xs text-muted-foreground">
                <MovementReference
                  referenceType={movement.referenceType}
                  referenceId={movement.referenceId}
                />
              </div>
            </TableCell>
            <TableCell className="font-semibold text-foreground">
              {movement.quantity}
            </TableCell>
            <TableCell>
              <span className="text-muted-foreground">
                {movement.previousStock}
              </span>{" "}
              → <span className="font-medium">{movement.newStock}</span>
            </TableCell>
            <TableCell className="hidden xl:table-cell">
              {movement.createdById
                ? `#${movement.createdById.slice(0, 8)}`
                : "Sistema"}
            </TableCell>
            <TableCell className="max-w-72 whitespace-normal">
              {movement.reason}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
