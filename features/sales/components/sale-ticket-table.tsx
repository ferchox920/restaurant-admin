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

export function SaleTicketTable({
  tickets,
}: {
  tickets: SaleTicketListItem[];
}) {
  return (
    <Table className="min-w-[720px]">
      <TableHeader>
        <TableRow>
          <TableHead>Ticket</TableHead>
          <TableHead>Canal</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Productos</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="hidden xl:table-cell">Responsables</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell>
              <p className="font-medium text-foreground">
                {formatTicketReadableId(ticket.id)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDateTime(ticket.createdAt)}
              </p>
            </TableCell>
            <TableCell>{ticket.salesChannel?.name ?? "Sin canal"}</TableCell>
            <TableCell>
              <SaleTicketStatusBadge status={ticket.status} />
            </TableCell>
            <TableCell>
              {ticket.itemsCount ?? 0}{" "}
              {(ticket.itemsCount ?? 0) === 1 ? "ítem" : "ítems"}
            </TableCell>
            <TableCell className="text-right font-semibold text-foreground">
              {formatMoney(ticket.total)}
            </TableCell>
            <TableCell className="hidden max-w-64 whitespace-normal xl:table-cell">
              <p className="text-sm">
                <span className="text-muted-foreground">Creó: </span>
                {formatSaleTicketActor(ticket.createdBy, ticket.createdById)}
              </p>
              {ticket.confirmedAt ? (
                <p className="mt-1 text-xs">
                  <span className="text-muted-foreground">Confirmó: </span>
                  {formatSaleTicketActor(
                    ticket.confirmedBy,
                    ticket.confirmedById
                  )}
                </p>
              ) : null}
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
