import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InventoryStockItem } from "@/features/inventory/types/inventory.types";

export function InventorySummaryCards({
  items,
}: {
  items: InventoryStockItem[];
}) {
  const available = items.filter((item) => item.stockStatus === "AVAILABLE").length;
  const lowStock = items.filter((item) => item.stockStatus === "LOW_STOCK").length;
  const outOfStock = items.filter((item) => item.stockStatus === "OUT_OF_STOCK").length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SummaryCard
        title="Disponibles"
        value={String(available)}
        description="Productos con stock por encima del minimo."
      />
      <SummaryCard
        title="Bajo stock"
        value={String(lowStock)}
        description="Productos que requieren seguimiento operativo."
      />
      <SummaryCard
        title="Agotados"
        value={String(outOfStock)}
        description="Productos sin stock actual disponible."
      />
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-3xl font-medium">{value}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
