import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SaleTicketStatusBadge } from "@/features/sales/components/sale-ticket-status-badge";
import type { SaleTicketDetail } from "@/features/sales/types/sale-ticket.types";
import { formatDateTime } from "@/lib/formatters";
import { formatMoney } from "@/lib/money";
import {
  formatSaleTicketActor,
  formatTicketReadableId,
} from "@/features/sales/utils/sale-ticket";

export function SaleTicketSummary({
  ticket,
  canViewCosts,
}: {
  ticket: SaleTicketDetail;
  canViewCosts: boolean;
}) {
  return (
    <Card>
      <CardHeader className="gap-3">
        <CardTitle className="flex flex-wrap items-center justify-between gap-3">
          <span>Resumen del ticket</span>
          <SaleTicketStatusBadge status={ticket.status} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Identificador</p>
            <p>{formatTicketReadableId(ticket.id)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Canal</p>
            <p>{ticket.salesChannel?.name ?? "Sin canal"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Creado por</p>
            <p>{formatSaleTicketActor(ticket.createdBy, ticket.createdById)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Creado</p>
            <p>{formatDateTime(ticket.createdAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Actualizado</p>
            <p>{formatDateTime(ticket.updatedAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Subtotal</p>
            <p>{formatMoney(ticket.subtotal)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total</p>
            <p>{formatMoney(ticket.total)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Confirmado por</p>
            <p>
              {ticket.confirmedAt
                ? formatSaleTicketActor(ticket.confirmedBy, ticket.confirmedById)
                : "-"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Confirmado</p>
            <p>{formatDateTime(ticket.confirmedAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Anulado por</p>
            <p>
              {ticket.voidedAt
                ? formatSaleTicketActor(ticket.voidedBy, ticket.voidedById)
                : "-"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Anulado</p>
            <p>{formatDateTime(ticket.voidedAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Motivo de void</p>
            <p>{ticket.voidReason || "-"}</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Notas</p>
          <p>{ticket.notes || "Sin notas"}</p>
        </div>

        <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
          La venta conserva los productos, cantidades e importes registrados al
          momento del cierre. {canViewCosts ? "Los costos se muestran segun el rol." : "Los costos quedan ocultos para este rol."}
        </div>
      </CardContent>
    </Card>
  );
}
