"use client";

import { useMemo, useState } from "react";
import { Clock, History, Play, ReceiptText, SlidersHorizontal } from "lucide-react";
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
import { useAllSalesChannels as useSalesChannels } from "@/features/sales-channels/hooks/use-all-sales-channels";
import { formatTicketReadableId } from "@/features/sales/utils/sale-ticket";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";
import { formatDateTime } from "@/lib/formatters";
import { formatMoney } from "@/lib/money";
import { PaginationControls } from "@/components/common/pagination-controls";
import { DEFAULT_PAGE_LIMIT } from "@/lib/api/pagination";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { isValidDateRange, toIsoDateBoundary } from "@/lib/api/date-range";

const initialFilters: SaleTicketFilterValues = {
  status: undefined,
  channelId: undefined,
  createdById: "",
  search: "",
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
  const [offset, setOffset] = useState(0);
  const deferredCreatedById = useDebouncedValue(filters.createdById.trim(), 300);
  const deferredSearch = useDebouncedValue(filters.search.trim(), 300);
  const validRange = isValidDateRange(filters.from, filters.to);

  const channelsQuery = useSalesChannels({ active: true });
  const createSaleTicketMutation = useCreateSaleTicket();
  const draftTicketsQuery = useSaleTickets({
    status: "DRAFT",
  });
  const saleTicketsQuery = useSaleTickets({
    status: filters.status,
    channelId: filters.channelId,
    createdById: deferredCreatedById || undefined,
    search: deferredSearch || undefined,
    from: validRange ? toIsoDateBoundary(filters.from, "start") : undefined,
    to: validRange ? toIsoDateBoundary(filters.to, "end") : undefined,
    limit: DEFAULT_PAGE_LIMIT,
    offset,
  }, validRange);

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
  const draftTickets = draftTicketsQuery.data ?? [];
  const activeFiltersCount = [
    filters.status,
    filters.channelId,
    filters.createdById.trim(),
    filters.search.trim(),
    filters.from,
    filters.to,
  ].filter(Boolean).length;

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
        description="Inicia una venta, continúa borradores y consulta el historial desde una misma pantalla."
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="overflow-hidden border-muted/70 bg-gradient-to-br from-background via-background to-muted/40 shadow-sm">
          <CardHeader className="gap-3">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ReceiptText aria-hidden="true" className="size-5" />
              Nueva venta
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Elige dónde se realiza la venta para comenzar a cargar el pedido.
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
                      aria-pressed={effectiveSelectedChannelId === channel.id}
                      className="rounded-2xl border bg-background p-4 text-left shadow-sm outline-none transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5 data-[selected=true]:shadow-md"
                      data-selected={effectiveSelectedChannelId === channel.id}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{channel.name}</p>
                        {effectiveSelectedChannelId === channel.id ? (
                          <Badge>Seleccionado</Badge>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Usar este canal para la nueva venta.
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

                {!canCreate ? (
                  <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                    Tu rol puede consultar ventas, pero no iniciar una nueva.
                  </p>
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
                      Iniciar venta
                    </>
                  )}
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-muted/70 bg-gradient-to-br from-background via-background to-muted/30 shadow-sm">
          <CardHeader className="gap-2">
            <CardTitle className="flex items-center gap-2">
              <Clock aria-hidden="true" className="size-5" />
              Borradores
              {!draftTicketsQuery.isLoading && !draftTicketsQuery.error ? (
                <Badge variant="secondary">{draftTickets.length}</Badge>
              ) : null}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ventas pendientes para continuar rápidamente.
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
            draftTickets.length === 0 ? (
              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                No hay ventas pendientes.
              </div>
            ) : null}

            {draftTickets.slice(0, 5).map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setActiveTicketId(ticket.id)}
                className="w-full rounded-2xl border bg-background p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
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

            {draftTickets.length > 5 ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  setFilters({ ...initialFilters, status: "DRAFT" })
                }
              >
                Ver los {draftTickets.length} borradores en el historial
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted/70 shadow-sm">
        <CardHeader className="gap-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <History aria-hidden="true" className="size-5" />
              Historial de ventas
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              {activeFiltersCount > 0
                ? `${activeFiltersCount} ${activeFiltersCount === 1 ? "filtro aplicado" : "filtros aplicados"}`
                : "Sin filtros"}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Consulta y abre ventas anteriores o pendientes.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <SaleTicketFilters
            channels={channelOptions}
            values={filters}
            onChange={(values) => { setFilters(values); setOffset(0); }}
            onReset={() => { setFilters(initialFilters); setOffset(0); }}
          />

          {!saleTicketsQuery.isLoading && !saleTicketsQuery.error ? (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {(saleTicketsQuery.data ?? []).length}{" "}
              {(saleTicketsQuery.data ?? []).length === 1
                ? "venta encontrada"
                : "ventas encontradas"}
            </p>
          ) : null}

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
          {!saleTicketsQuery.error && validRange ? (
            <PaginationControls offset={offset} limit={DEFAULT_PAGE_LIMIT} itemCount={saleTicketsQuery.data?.length ?? 0} onOffsetChange={setOffset} disabled={saleTicketsQuery.isFetching} />
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
