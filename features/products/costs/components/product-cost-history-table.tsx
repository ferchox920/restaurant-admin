import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductCostHistoryItem } from "@/features/products/costs/types/product-cost.types";
import { formatDateTime } from "@/lib/formatters";
import { formatMoney } from "@/lib/money";

type ProductCostHistoryTableProps = {
  items: ProductCostHistoryItem[];
};

export function ProductCostHistoryTable({
  items,
}: ProductCostHistoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Costo</TableHead>
          <TableHead>Vigencia desde</TableHead>
          <TableHead>Vigencia hasta</TableHead>
          <TableHead>Creado</TableHead>
          <TableHead>Creado por</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{formatMoney(item.cost)}</TableCell>
            <TableCell>{formatDateTime(item.validFrom)}</TableCell>
            <TableCell>{formatDateTime(item.validTo)}</TableCell>
            <TableCell>{formatDateTime(item.createdAt)}</TableCell>
            <TableCell>{item.createdById ?? "-"}</TableCell>
            <TableCell>{item.isCurrent ? "Vigente" : "Historico"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
