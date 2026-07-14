import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SalesByUserReportItem } from "@/features/reports/types/report.types";
import { formatNullableUserName } from "@/features/reports/utils/report-formatters";
import { formatMoney } from "@/lib/money";

export function SalesByUserReportTable({
  items,
}: {
  items: SalesByUserReportItem[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuario confirmador</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Tickets confirmados</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Unidades vendidas</TableHead>
          <TableHead>Ventas brutas</TableHead>
          <TableHead>Costo total</TableHead>
          <TableHead>Margen bruto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={item.userId ?? `unknown-${index}`}>
            <TableCell className="font-medium text-foreground">
              {formatNullableUserName(item.userFullName, item.userEmail)}
            </TableCell>
            <TableCell>{item.userEmail || "-"}</TableCell>
            <TableCell>{item.ticketsCount}</TableCell>
            <TableCell>{item.itemsCount}</TableCell>
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
