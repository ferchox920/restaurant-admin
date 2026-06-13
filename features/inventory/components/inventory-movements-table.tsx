import type { InventoryMovement } from "@/features/inventory/types/inventory.types";
import { InventoryMovementTable } from "@/features/inventory/components/inventory-movement-table";

export function InventoryMovementsTable({
  movements,
}: {
  movements: InventoryMovement[];
}) {
  return <InventoryMovementTable movements={movements} />;
}
