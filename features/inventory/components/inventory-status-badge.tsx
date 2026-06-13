import { Badge } from "@/components/ui/badge";
import type { InventoryStockStatus } from "@/features/inventory/types/inventory.types";

const stockStatusConfig: Record<
  InventoryStockStatus,
  { label: string; className: string }
> = {
  AVAILABLE: {
    label: "Disponible",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  LOW_STOCK: {
    label: "Stock bajo",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  OUT_OF_STOCK: {
    label: "Sin stock",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

export function InventoryStatusBadge({
  status,
}: {
  status: InventoryStockStatus;
}) {
  const config = stockStatusConfig[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
