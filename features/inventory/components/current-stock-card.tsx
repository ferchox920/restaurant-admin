import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductStatusBadges } from "@/features/products/components/product-status-badges";
import { StockStatusBadge } from "@/features/inventory/components/stock-status-badge";
import type { ProductInventoryDetail } from "@/features/inventory/types/inventory.types";
import type { Product } from "@/features/products/types/product.types";
import type { ProductUnit } from "@/features/products/types/product.types";
import {
  formatDateTime,
  formatProductUnit,
  formatStockManagementType,
} from "@/lib/formatters";

function formatInventoryUnit(unit: string) {
  return ["UNIT", "PORTION", "SERVICE"].includes(unit)
    ? formatProductUnit(unit as ProductUnit)
    : unit;
}

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
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-primary/5 p-4 ring-1 ring-primary/15">
            <p className="text-sm font-medium text-muted-foreground">
              Stock actual
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {inventory.currentStock}
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-sm font-medium text-muted-foreground">
              Stock mínimo
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {inventory.minimumStock}
            </p>
          </div>
        </div>
        <div className="grid gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="SKU" value={inventory.productSku || "Sin SKU"} />
          <Metric label="Unidad" value={formatInventoryUnit(inventory.unit)} />
          <Metric
            label="Control de stock"
            value={formatStockManagementType(inventory.stockManagementType)}
          />
          <Metric
            label="Última actualización"
            value={formatDateTime(inventory.updatedAt)}
          />
        </div>
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
