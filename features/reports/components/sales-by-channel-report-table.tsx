import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SalesByChannelReportItem } from "@/features/reports/types/report.types";
import { formatMoney } from "@/lib/money";

export function SalesByChannelReportTable({
  items,
}: {
  items: SalesByChannelReportItem[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Canal</TableHead>
          <TableHead>Codigo</TableHead>
          <TableHead>Tickets</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Cantidad</TableHead>
          <TableHead>Ventas</TableHead>
          <TableHead>Costo</TableHead>
          <TableHead>Margen</TableHead>
          <TableHead>Ticket promedio</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.salesChannelId}>
            <TableCell className="font-medium text-foreground">
              {item.salesChannelName}
            </TableCell>
            <TableCell>{item.salesChannelCode}</TableCell>
            <TableCell>{item.ticketsCount}</TableCell>
            <TableCell>{item.itemsCount}</TableCell>
            <TableCell>{item.quantitySold}</TableCell>
            <TableCell>{formatMoney(item.grossSales)}</TableCell>
            <TableCell>{formatMoney(item.historicalCost)}</TableCell>
            <TableCell>{formatMoney(item.grossProfit)}</TableCell>
            <TableCell>{formatMoney(item.averageTicket)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
