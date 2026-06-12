import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductPriceHistoryItem } from "@/features/products/prices/types/product-price.types";
import { formatDateTime } from "@/lib/formatters";
import { formatMoney } from "@/lib/money";

type ProductPriceHistoryTableProps = {
  items: ProductPriceHistoryItem[];
};

export function ProductPriceHistoryTable({
  items,
}: ProductPriceHistoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Canal</TableHead>
          <TableHead>Precio</TableHead>
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
            <TableCell>{item.salesChannelName ?? item.salesChannelId}</TableCell>
            <TableCell className="font-medium">{formatMoney(item.price)}</TableCell>
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
