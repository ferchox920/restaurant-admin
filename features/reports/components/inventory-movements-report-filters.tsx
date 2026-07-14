"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inventoryMovementTypes, inventoryReferenceTypes } from "@/features/inventory/types/inventory.types";
import type {
  InventoryMovementType,
  InventoryReferenceType,
} from "@/features/inventory/types/inventory.types";
import type { Product } from "@/features/products/types/product.types";

export type InventoryMovementsReportFilterValues = {
  from: string;
  to: string;
  productId: string;
  movementType: InventoryMovementType | "__all__";
  referenceType: InventoryReferenceType | "__all__";
  createdById: string;
  limit: string;
};

type InventoryMovementsReportFiltersProps = {
  products: Product[];
  values: InventoryMovementsReportFilterValues;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onProductIdChange: (value: string) => void;
  onMovementTypeChange: (value: InventoryMovementType | "__all__") => void;
  onReferenceTypeChange: (value: InventoryReferenceType | "__all__") => void;
  onCreatedByIdChange: (value: string) => void;
  onLimitChange: (value: string) => void;
  onReset: () => void;
};

const movementTypeLabels: Record<InventoryMovementType, string> = {
  STOCK_IN: "Ingreso de stock",
  MANUAL_ADJUSTMENT: "Ajuste manual",
  WASTE: "Merma",
  RETURN_IN: "Reingreso",
  SALE_OUT: "Salida por venta",
  VOID_REVERSAL: "Reversion de venta anulada",
};

const referenceTypeLabels: Record<InventoryReferenceType, string> = {
  MANUAL: "Manual",
  SALE_TICKET: "Ticket de venta",
  SALE_VOID: "Anulacion de venta",
  SYSTEM: "Sistema",
};

export function InventoryMovementsReportFilters({
  products,
  values,
  onFromChange,
  onToChange,
  onProductIdChange,
  onMovementTypeChange,
  onReferenceTypeChange,
  onCreatedByIdChange,
  onLimitChange,
  onReset,
}: InventoryMovementsReportFiltersProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="inventory-movements-from">Desde</Label>
          <Input
            id="inventory-movements-from"
            type="date"
            value={values.from}
            max={values.to || undefined}
            onChange={(event) => {
              const value = event.target.value;
              onFromChange(value);
              if (values.to && value > values.to) onToChange("");
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-movements-to">Hasta</Label>
          <Input
            id="inventory-movements-to"
            type="date"
            value={values.to}
            min={values.from || undefined}
            onChange={(event) => onToChange(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Producto</Label>
          <Select
            value={values.productId}
            onValueChange={(value) => onProductIdChange(value ?? "__all__")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los productos">
                {(value) => {
                  if (!value || value === "__all__") {
                    return "Todos los productos";
                  }

                  return (
                    products.find((product) => product.id === value)?.name ??
                    "Todos los productos"
                  );
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos los productos</SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tipo de movimiento</Label>
          <Select
            value={values.movementType}
            onValueChange={(value) =>
              onMovementTypeChange((value ?? "__all__") as InventoryMovementType | "__all__")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos">
                {(value) =>
                  !value || value === "__all__"
                    ? "Todos"
                    : movementTypeLabels[value as InventoryMovementType]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              {inventoryMovementTypes.map((item) => (
                <SelectItem key={item} value={item}>
                  {movementTypeLabels[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tipo de referencia</Label>
          <Select
            value={values.referenceType}
            onValueChange={(value) =>
              onReferenceTypeChange((value ?? "__all__") as InventoryReferenceType | "__all__")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas">
                {(value) =>
                  !value || value === "__all__"
                    ? "Todas"
                    : referenceTypeLabels[value as InventoryReferenceType]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              {inventoryReferenceTypes.map((item) => (
                <SelectItem key={item} value={item}>
                  {referenceTypeLabels[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-movements-created-by">
            Usuario creador (UUID avanzado)
          </Label>
          <Input
            id="inventory-movements-created-by"
            value={values.createdById}
            onChange={(event) => onCreatedByIdChange(event.target.value)}
            placeholder="ID del usuario"
          />
          <p className="text-xs text-muted-foreground">
            Se conserva como filtro avanzado para no consultar `/api/users` desde roles sin permiso.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory-movements-limit">Limite por pagina</Label>
          <Input
            id="inventory-movements-limit"
            value={values.limit}
            onChange={(event) => onLimitChange(event.target.value)}
            inputMode="numeric"
            placeholder="50"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcw aria-hidden="true" />
          Limpiar filtros
        </Button>
      </div>
    </>
  );
}
