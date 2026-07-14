import type { InventoryReferenceType } from "@/features/inventory/types/inventory.types";

const referenceTypeLabels: Record<InventoryReferenceType, string> = {
  MANUAL: "Manual",
  SALE_TICKET: "Ticket de venta",
  SALE_VOID: "Anulación de venta",
  SYSTEM: "Sistema",
};

export function MovementReference({
  referenceType,
  referenceId,
}: {
  referenceType: InventoryReferenceType;
  referenceId: string | null;
}) {
  return (
    <div className="space-y-1">
      <p>{referenceTypeLabels[referenceType]}</p>
      {referenceId ? (
        <p className="text-xs text-muted-foreground">
          Ref. #{referenceId.slice(0, 8)}
        </p>
      ) : null}
    </div>
  );
}
