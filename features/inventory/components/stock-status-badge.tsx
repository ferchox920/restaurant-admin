import { Badge } from "@/components/ui/badge";
import type { InventoryStockStatus } from "@/features/inventory/types/inventory.types";

const stockStatusConfig: Record<
  InventoryStockStatus,
  { label: string; className: string }
> = {
  AVAILABLE: {
    label: "Disponible",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  LOW_STOCK: {
    label: "Bajo stock",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  },
  OUT_OF_STOCK: {
    label: "Agotado",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  },
};

export function StockStatusBadge({
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
