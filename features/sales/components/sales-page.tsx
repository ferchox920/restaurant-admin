"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Clock, History, Play, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { SaleTicketPage } from "@/features/sales/components/sale-ticket-page";
import { SaleTicketFilters, type SaleTicketFilterValues } from "@/features/sales/components/sale-ticket-filters";
import { SaleTicketTable } from "@/features/sales/components/sale-ticket-table";
import { useCreateSaleTicket } from "@/features/sales/hooks/use-create-sale-ticket";
import { useSaleTickets } from "@/features/sales/hooks/use-sale-tickets";
import { useSalesChannels } from "@/features/sales-channels/hooks/use-sales-channels";
import { formatTicketReadableId } from "@/features/sales/utils/sale-ticket";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";
import { formatDateTime } from "@/lib/formatters";
import { formatMoney } from "@/lib/money";

const initialFilters: SaleTicketFilterValues = {
  status: undefined,
  channelId: undefined,
  createdById: "",
  from: "",
  to: "",
};

export function SalesPage() {
  const { user } = useAuth();
  const canCreate =
    user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "CASHIER";
  const [filters, setFilters] = useState<SaleTicketFilterValues>(initialFilters);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const deferredCreatedById = useDeferredValue(filters.createdById.trim());

  const channelsQuery = useSalesChannels({ active: true });
  const createSaleTicketMutation = useCreateSaleTicket();
  const draftTicketsQuery = useSaleTickets({
    status: "DRAFT",
  });
  const saleTicketsQuery = useSaleTickets({
    status: filters.status,
    channelId: filters.channelId,
    createdById: deferredCreatedById || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  });

  const channelOptions = useMemo(
    () =>
      (channelsQuery.data ?? [])
        .filter((channel) => channel.active)
        .map((channel) => ({
          id: channel.id,
          name: channel.name,
          active: channel.active,
        })),
    [channelsQuery.data]
  );

  const effectiveSelectedChannelId =
    selectedChannelId || channelOptions[0]?.id || "";

  async function handleStartSale(channelId = effectiveSelectedChannelId) {
    if (!channelId) {
      return;
    }

    const ticket = await createSaleTicketMutation.mutateAsync({
      salesChannelId: channelId,
    });
    setActiveTicketId(ticket.id);
  }

  const isForbidden =
    saleTicketsQuery.error &&
    isApiError(saleTicketsQuery.error) &&
    saleTicketsQuery.error.statusCode === HTTP_STATUS.forbidden;

  if (activeTicketId) {
    return (
      <SaleTicketPage
        ticketId={activeTicketId}
        onBack={() => setActiveTicketId(null)}
      />
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Ventas"
        title="Caja"
        description="Inicia una venta, continua borradores y consulta el historial desde una misma pantalla."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="bg-card">
          <CardHeader className="gap-3">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ReceiptText aria-hidden="true" className="size-5" />
              Nueva venta
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Selecciona el canal y entra directo al panel de productos y pedido.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {channelsQuery.isLoading ? (
              <LoadingState
                title="Cargando canales"
                message="Estamos preparando los canales activos."
                className="w-full max-w-none shadow-none"
              />
            ) : null}

            {channelsQuery.error ? (
              <ErrorMessage
                title="No se pudieron cargar los canales"
                messages={getApiErrorMessages(channelsQuery.error)}
              />
            ) : null}

            {!channelsQuery.isLoading &&
            !channelsQuery.error &&
            channelOptions.length === 0 ? (
              <EmptyState
                title="Sin canales activos"
                message="No hay canales disponibles para iniciar una venta."
                className="w-full max-w-none shadow-none"
              />
            ) : null}

            {channelOptions.length > 0 ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {channelOptions.map((channel) => (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => setSelectedChannelId(channel.id)}
                      className="rounded-lg border bg-background p-4 text-left transition-colors hover:bg-muted/60 data-[selected=true]:border-primary data-[selected=true]:bg-muted"
                      data-selected={effectiveSelectedChannelId === channel.id}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{channel.name}</p>
                        {effectiveSelectedChannelId === channel.id ? (
                          <Badge>Activo</Badge>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Crear venta en este canal.
                      </p>
                    </button>
                  ))}
                </div>

                {createSaleTicketMutation.error ? (
                  <ErrorMessage
                    title="No se pudo iniciar la venta"
                    messages={getApiErrorMessages(createSaleTicketMutation.error)}
                  />
                ) : null}

                <Button
                  type="button"
                  size="lg"
                  disabled={
                    !canCreate ||
                    !effectiveSelectedChannelId ||
                    createSaleTicketMutation.isPending
                  }
                  onClick={() => handleStartSale()}
                  className="w-full sm:w-auto"
                >
                  {createSaleTicketMutation.isPending ? (
                    "Iniciando..."
                  ) : (
                    <>
                      <Play aria-hidden="true" data-icon="inline-start" />
                      Abrir caja
                    </>
                  )}
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-2">
            <CardTitle className="flex items-center gap-2">
              <Clock aria-hidden="true" className="size-5" />
              Borradores
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ventas pendientes para continuar rapido.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {draftTicketsQuery.isLoading ? (
              <LoadingState
                title="Cargando borradores"
                message="Estamos buscando ventas pendientes."
                className="w-full max-w-none shadow-none"
              />
            ) : null}

            {draftTicketsQuery.error ? (
              <ErrorMessage
                title="No se pudieron cargar los borradores"
                messages={getApiErrorMessages(draftTicketsQuery.error)}
              />
            ) : null}

            {!draftTicketsQuery.isLoading &&
            !draftTicketsQuery.error &&
            (draftTicketsQuery.data?.length ?? 0) === 0 ? (
              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                No hay ventas pendientes.
              </div>
            ) : null}

            {(draftTicketsQuery.data ?? []).slice(0, 5).map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setActiveTicketId(ticket.id)}
                className="w-full rounded-lg border bg-background p-3 text-left transition-colors hover:bg-muted/60"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{formatTicketReadableId(ticket.id)}</p>
                  <span className="text-sm font-medium">
                    {formatMoney(ticket.total)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ticket.salesChannel?.name ?? "Sin canal"} ·{" "}
                  {formatDateTime(ticket.createdAt)}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History aria-hidden="true" className="size-5" />
            Historial de ventas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SaleTicketFilters
            channels={channelOptions}
            values={filters}
            onChange={setFilters}
            onReset={() => setFilters(initialFilters)}
          />

          {saleTicketsQuery.isLoading ? (
            <LoadingState
              title="Cargando tickets"
              message="Estamos consultando las ventas registradas."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {saleTicketsQuery.error ? (
            <ErrorMessage
              variant={isForbidden ? "forbidden" : "general"}
              title={
                isForbidden
                  ? "Acceso restringido"
                  : "No se pudo cargar el listado de tickets"
              }
              messages={getApiErrorMessages(saleTicketsQuery.error)}
            />
          ) : null}

          {!saleTicketsQuery.isLoading &&
          !saleTicketsQuery.error &&
          (saleTicketsQuery.data?.length ?? 0) === 0 ? (
            <EmptyState
              title="Sin tickets"
              message="No hay tickets para los filtros seleccionados."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {!saleTicketsQuery.isLoading &&
          !saleTicketsQuery.error &&
          (saleTicketsQuery.data?.length ?? 0) > 0 ? (
            <SaleTicketTable tickets={saleTicketsQuery.data ?? []} />
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
