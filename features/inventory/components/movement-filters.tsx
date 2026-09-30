"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InventoryMovementType } from "@/features/inventory/types/inventory.types";

const movementTypeLabels: Record<InventoryMovementType, string> = {
  STOCK_IN: "Ingreso de stock",
  SALE_OUT: "Salida por venta",
  MANUAL_ADJUSTMENT: "Ajuste manual",
  WASTE: "Merma",
  RETURN_IN: "Reingreso",
  VOID_REVERSAL: "Reversión de venta anulada",
};

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
  const hasFilters = Boolean(movementType || from || to);
  const hasInvalidDateRange = Boolean(from && to && from > to);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label>Tipo de movimiento</Label>
        <Select
          value={movementType ?? "__all__"}
          onValueChange={(value) =>
            onMovementTypeChange(
              value === "__all__" ? undefined : (value as InventoryMovementType)
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value) =>
                value && value !== "__all__"
                  ? movementTypeLabels[value as InventoryMovementType]
                  : "Todos los movimientos"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos los movimientos</SelectItem>
            {Object.entries(movementTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="movement-from">Desde</Label>
        <Input
          id="movement-from"
          type="date"
          value={from}
          max={to || undefined}
          aria-invalid={hasInvalidDateRange}
          onChange={(event) => onFromChange(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="movement-to">Hasta</Label>
        <Input
          id="movement-to"
          type="date"
          value={to}
          min={from || undefined}
          aria-invalid={hasInvalidDateRange}
          onChange={(event) => onToChange(event.target.value)}
        />
      </div>
      {hasInvalidDateRange ? (
        <p className="text-sm text-destructive md:col-span-3">
          La fecha inicial no puede ser posterior a la fecha final.
        </p>
      ) : null}
      <div className="md:col-span-3">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={!hasFilters}
          onClick={() => {
            onMovementTypeChange(undefined);
            onFromChange("");
            onToChange("");
          }}
        >
          <RotateCcw aria-hidden="true" />
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}
