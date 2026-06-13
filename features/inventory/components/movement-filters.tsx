"use client";

import type { InventoryMovementType } from "@/features/inventory/types/inventory.types";

type MovementFiltersProps = {
  movementType?: InventoryMovementType;
  from: string;
  to: string;
  onMovementTypeChange: (value?: InventoryMovementType) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

export function MovementFilters({
  movementType,
  from,
  to,
  onMovementTypeChange,
  onFromChange,
  onToChange,
}: MovementFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <label className="space-y-2 text-sm">
        <span className="font-medium">Tipo de movimiento</span>
        <select
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
          value={movementType ?? "__all__"}
          onChange={(event) =>
            onMovementTypeChange(
              event.target.value === "__all__"
                ? undefined
                : (event.target.value as InventoryMovementType)
            )
          }
        >
          <option value="__all__">Todos</option>
          <option value="STOCK_IN">Ingreso de stock</option>
          <option value="SALE_OUT">Salida por venta</option>
          <option value="MANUAL_ADJUSTMENT">Ajuste manual</option>
          <option value="WASTE">Merma</option>
          <option value="RETURN_IN">Reingreso</option>
          <option value="VOID_REVERSAL">Reversion de venta anulada</option>
        </select>
      </label>
      <label className="space-y-2 text-sm">
        <span className="font-medium">Desde</span>
        <input
          type="date"
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
          value={from}
          onChange={(event) => onFromChange(event.target.value)}
        />
      </label>
      <label className="space-y-2 text-sm">
        <span className="font-medium">Hasta</span>
        <input
          type="date"
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
          value={to}
          onChange={(event) => onToChange(event.target.value)}
        />
      </label>
    </div>
  );
}
