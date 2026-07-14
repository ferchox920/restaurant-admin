import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockStatusBadge } from "@/features/inventory/components/stock-status-badge";
import type { InventoryStockItem } from "@/features/inventory/types/inventory.types";
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

export function InventoryTable({
  items,
}: {
  items: InventoryStockItem[];
}) {
  return (
    <Table className="min-w-[680px]">
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>Control</TableHead>
          <TableHead>Existencias</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="hidden lg:table-cell">Actualizado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow
            key={item.productId}
            className={
              item.stockStatus === "OUT_OF_STOCK"
                ? "bg-rose-500/[0.04]"
                : item.stockStatus === "LOW_STOCK"
                  ? "bg-amber-500/[0.04]"
                  : undefined
            }
          >
            <TableCell className="max-w-72 whitespace-normal">
              <Link
                href={`/inventory/${item.productId}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {item.productName}
              </Link>
              {item.productSku ? (
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {item.productSku}
                </p>
              ) : null}
            </TableCell>
            <TableCell>
              <p>{formatStockManagementType(item.stockManagementType)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatInventoryUnit(item.unit)}
              </p>
            </TableCell>
            <TableCell>
              <p className="text-lg font-semibold text-foreground">
                {item.currentStock}
              </p>
              <p className="text-xs text-muted-foreground">
                Mínimo: {item.minimumStock}
              </p>
            </TableCell>
            <TableCell>
              <StockStatusBadge status={item.stockStatus} />
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              {formatDateTime(item.updatedAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
