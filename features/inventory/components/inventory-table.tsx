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
import { formatDateTime, formatStockManagementType } from "@/lib/formatters";

export function InventoryTable({
  items,
}: {
  items: InventoryStockItem[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Unidad</TableHead>
          <TableHead>Tipo de stock</TableHead>
          <TableHead>Stock actual</TableHead>
          <TableHead>Stock minimo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Actualizado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.productId}>
            <TableCell className="font-medium text-foreground">
              <Link
                href={`/inventory/${item.productId}`}
                className="underline-offset-4 hover:underline"
              >
                {item.productName}
              </Link>
            </TableCell>
            <TableCell>{item.productSku || "-"}</TableCell>
            <TableCell>{item.unit}</TableCell>
            <TableCell>
              {formatStockManagementType(item.stockManagementType)}
            </TableCell>
            <TableCell>{item.currentStock}</TableCell>
            <TableCell>{item.minimumStock}</TableCell>
            <TableCell>
              <StockStatusBadge status={item.stockStatus} />
            </TableCell>
            <TableCell>{formatDateTime(item.updatedAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
