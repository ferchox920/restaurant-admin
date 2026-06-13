import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductStatusBadges } from "@/features/products/components/product-status-badges";
import { StockStatusBadge } from "@/features/inventory/components/stock-status-badge";
import type { ProductInventoryDetail } from "@/features/inventory/types/inventory.types";
import type { Product } from "@/features/products/types/product.types";
import { formatDateTime, formatStockManagementType } from "@/lib/formatters";

export function CurrentStockCard({
  product,
  inventory,
}: {
  product: Product;
  inventory: ProductInventoryDetail;
}) {
  return (
    <Card>
      <CardHeader className="gap-3">
        <CardTitle className="flex flex-wrap items-center justify-between gap-3">
          <span>Estado actual</span>
          <div className="flex flex-wrap gap-2">
            <StockStatusBadge status={inventory.stockStatus} />
            <ProductStatusBadges product={product} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Metric label="Stock actual" value={inventory.currentStock} />
        <Metric label="Stock minimo" value={inventory.minimumStock} />
        <Metric label="SKU" value={inventory.productSku || "-"} />
        <Metric label="Unidad" value={inventory.unit} />
        <Metric
          label="Tipo de stock"
          value={formatStockManagementType(inventory.stockManagementType)}
        />
        <Metric label="Actualizado" value={formatDateTime(inventory.updatedAt)} />
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p>{value}</p>
    </div>
  );
}
