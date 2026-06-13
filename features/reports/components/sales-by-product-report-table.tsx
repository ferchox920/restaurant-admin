"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SalesByProductReportItem } from "@/features/reports/types/report.types";
import { formatMoney } from "@/lib/money";

export function SalesByProductReportTable({
  items,
}: {
  items: SalesByProductReportItem[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto snapshot</TableHead>
          <TableHead>SKU snapshot</TableHead>
          <TableHead>Unidad snapshot</TableHead>
          <TableHead>Tickets</TableHead>
          <TableHead>Cantidad</TableHead>
          <TableHead>Ventas</TableHead>
          <TableHead>Costo</TableHead>
          <TableHead>Margen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          // Backend contract currently groups this report by productId.
          <TableRow key={item.productId}>
            <TableCell className="font-medium text-foreground">
              <div className="space-y-1">
                <p>{item.productNameSnapshot}</p>
                <Link
                  href={`/products/${item.productId}`}
                  className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  Ver producto actual sin reemplazar snapshot
                </Link>
              </div>
            </TableCell>
            <TableCell>{item.productSkuSnapshot || "-"}</TableCell>
            <TableCell>{item.productUnitSnapshot}</TableCell>
            <TableCell>{item.ticketsCount}</TableCell>
            <TableCell>{item.quantitySold}</TableCell>
            <TableCell>{formatMoney(item.grossSales)}</TableCell>
            <TableCell>{formatMoney(item.historicalCost)}</TableCell>
            <TableCell>{formatMoney(item.grossProfit)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
