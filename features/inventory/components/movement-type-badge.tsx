import { Badge } from "@/components/ui/badge";
import type { InventoryMovementType } from "@/features/inventory/types/inventory.types";

const movementTypeConfig: Record<
  InventoryMovementType,
  { label: string; className: string; automatic: boolean }
> = {
  STOCK_IN: {
    label: "Ingreso de stock",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    automatic: false,
  },
  MANUAL_ADJUSTMENT: {
    label: "Ajuste manual",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    automatic: false,
  },
  WASTE: {
    label: "Merma",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    automatic: false,
  },
  RETURN_IN: {
    label: "Reingreso",
    className: "border-sky-200 bg-sky-50 text-sky-700",
    automatic: false,
  },
  SALE_OUT: {
    label: "Salida por venta",
    className: "border-slate-300 bg-slate-100 text-slate-700",
    automatic: true,
  },
  VOID_REVERSAL: {
    label: "Reversion de venta anulada",
    className: "border-violet-200 bg-violet-50 text-violet-700",
    automatic: true,
  },
};

export function MovementTypeBadge({
  movementType,
}: {
  movementType: InventoryMovementType;
}) {
  const config = movementTypeConfig[movementType];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
      {config.automatic ? (
        <Badge variant="outline" className="border-border text-muted-foreground">
          Automatico
        </Badge>
      ) : null}
    </div>
  );
}
