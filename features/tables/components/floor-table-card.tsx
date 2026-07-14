"use client";

import { DoorOpen, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorMessage } from "@/components/feedback/error-message";
import { TableStatusBadge } from "@/features/tables/components/table-status-badge";
import { OpenTableOrderDialog } from "@/features/tables/components/open-table-order-dialog";
import type { RestaurantTable } from "@/features/tables/types/table.types";
import type { SalesChannel } from "@/features/sales-channels/types/sales-channel.types";
import type { OpenTableOrderFormValues } from "@/features/table-orders/types/table-order.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { formatDateTime } from "@/lib/formatters";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

type Props = {
  table: RestaurantTable;
  channels: SalesChannel[];
  canOperate: boolean;
  isOpening?: boolean;
  isViewing?: boolean;
  openError?: unknown;
  viewError?: unknown;
  onOpenOrder: (
    table: RestaurantTable,
    values: OpenTableOrderFormValues
  ) => Promise<void> | void;
  onViewOrder: (table: RestaurantTable) => Promise<void> | void;
};

export function FloorTableCard({
  table,
  channels,
  canOperate,
  isOpening = false,
  isViewing = false,
  openError,
  viewError,
  onOpenOrder,
  onViewOrder,
}: Props) {
  const total =
    table.currentOrder?.total ?? table.currentOrder?.saleTicket?.total ?? null;

  return (
    <Card
      className={cn(
        "border-muted/70 shadow-sm transition-colors",
        table.status === "INACTIVE" && "opacity-65",
        table.status === "AVAILABLE" && "border-emerald-500/30",
        table.status === "OCCUPIED" &&
          "border-amber-500/40 bg-amber-500/[0.03]",
      )}
    >
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-2xl">{table.code}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {table.name || "Sin nombre"}
            </p>
          </div>
          <TableStatusBadge status={table.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="grid flex-1 gap-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Users aria-hidden="true" className="size-4" />
            {table.capacity
              ? `Hasta ${table.capacity} personas`
              : "Capacidad sin definir"}
          </p>
          {table.status === "OCCUPIED" ? (
            <>
              <p>
                <span className="text-muted-foreground">Abierta: </span>
                <span className="text-foreground">
                  {formatDateTime(table.currentOrder?.openedAt)}
                </span>
              </p>
              <p className="flex items-center justify-between rounded-lg bg-amber-500/10 px-3 py-2">
                <span>Total actual</span>
                <span className="text-lg font-semibold text-foreground">
                  {total !== null ? formatMoney(total) : "-"}
                </span>
              </p>
            </>
          ) : null}
        </div>

        {table.status === "AVAILABLE" && canOperate ? (
          <OpenTableOrderDialog
            table={table}
            channels={channels}
            isPending={isOpening}
            error={openError}
            onSubmit={(values) => onOpenOrder(table, values)}
            trigger={
              <Button type="button" className="w-full">
                <DoorOpen aria-hidden="true" />
                Abrir orden
              </Button>
            }
          />
        ) : null}

        {table.status === "AVAILABLE" && !canOperate ? (
          <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            Mesa disponible. Solo lectura.
          </p>
        ) : null}

        {table.status === "OCCUPIED" ? (
          <Button
            type="button"
            className="w-full"
            disabled={isViewing}
            onClick={() => {
              void onViewOrder(table);
            }}
          >
            <Eye aria-hidden="true" />
            {isViewing ? "Abriendo orden..." : "Continuar orden"}
          </Button>
        ) : null}

        {table.status === "OCCUPIED" && viewError ? (
          <ErrorMessage
            title="No se pudo abrir la orden"
            messages={getApiErrorMessages(viewError)}
          />
        ) : null}

        {table.status === "INACTIVE" ? (
          <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            Mesa inactiva. No permite acciones operativas.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
