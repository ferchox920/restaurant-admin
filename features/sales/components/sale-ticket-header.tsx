"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { SaleTicketStatusBadge } from "@/features/sales/components/sale-ticket-status-badge";
import type { SaleTicketDetail } from "@/features/sales/types/sale-ticket.types";
import { formatTicketReadableId } from "@/features/sales/utils/sale-ticket";

type SaleTicketHeaderProps = {
  ticket: SaleTicketDetail;
  criticalActions?: React.ReactNode;
  onBack?: () => void;
};

export function SaleTicketHeader({
  ticket,
  criticalActions,
  onBack,
}: SaleTicketHeaderProps) {
  return (
    <>
      <PageHeader
        eyebrow="Ventas"
        title={`Ticket ${formatTicketReadableId(ticket.id)}`}
        description={`Venta en ${ticket.salesChannel?.name ?? "canal sin nombre"}. Agrega productos, registra el pago y confirma el cobro.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <SaleTicketStatusBadge status={ticket.status} />
            {onBack ? (
              <Button type="button" variant="outline" onClick={onBack}>
                <ArrowLeft aria-hidden="true" data-icon="inline-start" />
                Volver
              </Button>
            ) : (
              <Button
                render={<Link href="/sales" />}
                nativeButton={false}
                type="button"
                variant="outline"
              >
                <ArrowLeft aria-hidden="true" data-icon="inline-start" />
                Volver
              </Button>
            )}
          </div>
        }
      />

      {criticalActions}
    </>
  );
}
