import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SaleTicketActions } from "@/features/sales/components/sale-ticket-actions";
import { SaleTicketStatusBadge } from "@/features/sales/components/sale-ticket-status-badge";
import type { SaleTicketListItem } from "@/features/sales/types/sale-ticket.types";
import { formatDateTime } from "@/lib/formatters";
import { formatMoney } from "@/lib/money";
import {
  formatSaleTicketActor,
  formatTicketReadableId,
} from "@/features/sales/utils/sale-ticket";

export function SaleTicketTable({ tickets }: { tickets: SaleTicketListItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticket</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Canal</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Creado por</TableHead>
          <TableHead>Confirmado por</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell className="font-medium text-foreground">
              {formatTicketReadableId(ticket.id)}
            </TableCell>
            <TableCell>{formatDateTime(ticket.createdAt)}</TableCell>
            <TableCell>{ticket.salesChannel?.name ?? "Sin canal"}</TableCell>
            <TableCell>
              <SaleTicketStatusBadge status={ticket.status} />
            </TableCell>
            <TableCell>{formatMoney(ticket.total)}</TableCell>
            <TableCell>
              {formatSaleTicketActor(ticket.createdBy, ticket.createdById)}
            </TableCell>
            <TableCell>
              {ticket.confirmedAt
                ? formatSaleTicketActor(ticket.confirmedBy, ticket.confirmedById)
                : "-"}
            </TableCell>
            <TableCell>
              <SaleTicketActions ticketId={ticket.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
