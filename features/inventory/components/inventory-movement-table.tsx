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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Cantidad</TableHead>
          <TableHead>Stock anterior</TableHead>
          <TableHead>Stock nuevo</TableHead>
          <TableHead>Usuario</TableHead>
          <TableHead>Referencia</TableHead>
          <TableHead>Motivo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((movement) => (
          <TableRow key={movement.id}>
            <TableCell>{formatDateTime(movement.createdAt)}</TableCell>
            <TableCell>
              <MovementTypeBadge movementType={movement.movementType} />
            </TableCell>
            <TableCell>{movement.quantity}</TableCell>
            <TableCell>{movement.previousStock}</TableCell>
            <TableCell>{movement.newStock}</TableCell>
            <TableCell>{movement.createdById ?? "-"}</TableCell>
            <TableCell>
              <MovementReference
                referenceType={movement.referenceType}
                referenceId={movement.referenceId}
              />
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
