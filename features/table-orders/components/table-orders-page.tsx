"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { TableOrderStatusBadge } from "@/features/table-orders/components/table-order-status-badge";
import { useTableOrders } from "@/features/table-orders/hooks/use-table-orders";
import type { TableOrderStatus } from "@/features/table-orders/types/table-order.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { formatDateTime } from "@/lib/formatters";
import { formatMoney } from "@/lib/money";
import { PaginationControls } from "@/components/common/pagination-controls";
import { DEFAULT_PAGE_LIMIT } from "@/lib/api/pagination";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { INVALID_DATE_RANGE_MESSAGE, isValidDateRange, toIsoDateBoundary } from "@/lib/api/date-range";

type StatusFilter = "all" | TableOrderStatus;

export function TableOrdersPage() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [tableId, setTableId] = useState("");
  const [openedById, setOpenedById] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [offset, setOffset] = useState(0);
  const deferredTableId = useDebouncedValue(tableId.trim(), 300);
  const deferredOpenedById = useDebouncedValue(openedById.trim(), 300);
  const validRange = isValidDateRange(from, to);
  const ordersQuery = useTableOrders({
    status: status === "all" ? undefined : status,
    tableId: deferredTableId || undefined,
    openedById: deferredOpenedById || undefined,
    from: validRange ? toIsoDateBoundary(from, "start") : undefined,
    to: validRange ? toIsoDateBoundary(to, "end") : undefined,
    limit: DEFAULT_PAGE_LIMIT,
    offset,
  }, validRange);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Salon"
        title="Ordenes de mesa"
        description="Historial y seguimiento de ordenes abiertas, canceladas y cerradas."
      />

      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={(value) => { setStatus(value as StatusFilter); setOffset(0); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="OPEN">Abiertas</SelectItem>
                  <SelectItem value="CANCELLED">Canceladas</SelectItem>
                  <SelectItem value="CLOSED">Cerradas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="table-orders-table-id">Mesa ID</Label>
              <Input
                id="table-orders-table-id"
                value={tableId}
                onChange={(event) => { setTableId(event.target.value); setOffset(0); }}
                placeholder="UUID avanzado"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="table-orders-opened-by">Apertura por</Label>
              <Input
                id="table-orders-opened-by"
                value={openedById}
                onChange={(event) => { setOpenedById(event.target.value); setOffset(0); }}
                placeholder="UUID avanzado"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="table-orders-from">Desde</Label>
              <Input
                id="table-orders-from"
                type="date"
                value={from}
                onChange={(event) => {
                  const value = event.target.value;
                  setFrom(value);
                  setOffset(0);
                  if (to && value > to) setTo("");
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="table-orders-to">Hasta</Label>
              <Input
                id="table-orders-to"
                type="date"
                value={to}
                onChange={(event) => { setTo(event.target.value); setOffset(0); }}
              />
            </div>
          </div>
          {!validRange ? <p className="text-sm text-destructive">{INVALID_DATE_RANGE_MESSAGE}</p> : null}

          {ordersQuery.isLoading ? (
            <LoadingState
              title="Cargando ordenes"
              message="Estamos consultando las ordenes de mesa."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {ordersQuery.error ? (
            <ErrorMessage
              title="No se pudieron cargar las ordenes"
              messages={getApiErrorMessages(ordersQuery.error)}
            />
          ) : null}

          {!ordersQuery.isLoading &&
          !ordersQuery.error &&
          (ordersQuery.data?.length ?? 0) === 0 ? (
            <EmptyState
              title="Sin ordenes"
              message="No hay ordenes para los filtros seleccionados."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {!ordersQuery.isLoading &&
          !ordersQuery.error &&
          (ordersQuery.data?.length ?? 0) > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mesa</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Apertura</TableHead>
                    <TableHead>Cierre/cancelacion</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Usuario apertura</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(ordersQuery.data ?? []).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.tableCode}
                        {order.tableName ? ` - ${order.tableName}` : ""}
                      </TableCell>
                      <TableCell>{order.tableArea || "-"}</TableCell>
                      <TableCell>
                        <TableOrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>{formatDateTime(order.openedAt)}</TableCell>
                      <TableCell>
                        {formatDateTime(order.closedAt ?? order.cancelledAt)}
                      </TableCell>
                      <TableCell>{formatMoney(order.saleTicket.total)}</TableCell>
                      <TableCell>{order.openedById}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          nativeButton={false}
                          render={
                            <Link href={`/table-orders/${order.id}`}>
                              <Eye aria-hidden="true" />
                              Abrir detalle
                            </Link>
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
          {!ordersQuery.error && validRange ? (
            <PaginationControls offset={offset} limit={DEFAULT_PAGE_LIMIT} itemCount={ordersQuery.data?.length ?? 0} onOffsetChange={setOffset} disabled={ordersQuery.isFetching} />
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
