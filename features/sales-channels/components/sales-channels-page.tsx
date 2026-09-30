"use client";

import { useMemo, useState } from "react";
import { CircleCheck, CircleOff, Plus, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/common/page-header";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useSalesChannels } from "@/features/sales-channels/hooks/use-sales-channels";
import { useCreateSalesChannel } from "@/features/sales-channels/hooks/use-create-sales-channel";
import { useUpdateSalesChannel } from "@/features/sales-channels/hooks/use-update-sales-channel";
import { useDeactivateSalesChannel } from "@/features/sales-channels/hooks/use-deactivate-sales-channel";
import { useReactivateSalesChannel } from "@/features/sales-channels/hooks/use-reactivate-sales-channel";
import { SalesChannelForm } from "@/features/sales-channels/components/sales-channel-form";
import { SalesChannelTable } from "@/features/sales-channels/components/sales-channel-table";
import type {
  CreateSalesChannelInput,
  SalesChannel,
  UpdateSalesChannelInput,
} from "@/features/sales-channels/types/sales-channel.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { PaginationControls } from "@/components/common/pagination-controls";
import { DEFAULT_PAGE_LIMIT } from "@/lib/api/pagination";

type SalesChannelFilterValue = "all" | "active" | "inactive";

export function SalesChannelsPage() {
  const { user } = useAuth();
  const canMutate = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [filter, setFilter] = useState<SalesChannelFilterValue>("all");
  const [offset, setOffset] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSalesChannel, setEditingSalesChannel] =
    useState<SalesChannel | null>(null);
  const [pendingSalesChannelId, setPendingSalesChannelId] = useState<
    string | null
  >(null);
  const [pendingAction, setPendingAction] = useState<
    "deactivate" | "reactivate" | null
  >(null);

  const salesChannelsQuery = useSalesChannels({
    active: filter === "all" ? undefined : filter === "active",
    limit: DEFAULT_PAGE_LIMIT,
    offset,
  });
  const createSalesChannelMutation = useCreateSalesChannel();
  const updateSalesChannelMutation = useUpdateSalesChannel();
  const deactivateSalesChannelMutation = useDeactivateSalesChannel();
  const reactivateSalesChannelMutation = useReactivateSalesChannel();

  const salesChannels = salesChannelsQuery.data ?? [];
  const channelCounts = useMemo(() => {
    const items = salesChannelsQuery.data ?? [];
    const active = items.filter((salesChannel) => salesChannel.active).length;

    return {
      total: items.length,
      active,
      inactive: items.length - active,
    };
  }, [salesChannelsQuery.data]);

  const queryMessages = salesChannelsQuery.error
    ? getApiErrorMessages(salesChannelsQuery.error)
    : [];
  const isForbiddenQuery =
    salesChannelsQuery.error &&
    isApiError(salesChannelsQuery.error) &&
    salesChannelsQuery.error.statusCode === HTTP_STATUS.forbidden;

  async function handleCreateSalesChannel(values: CreateSalesChannelInput) {
    await createSalesChannelMutation.mutateAsync(values);
    setIsCreateOpen(false);
  }

  async function handleUpdateSalesChannel(values: UpdateSalesChannelInput) {
    if (!editingSalesChannel) {
      return;
    }

    await updateSalesChannelMutation.mutateAsync({
      salesChannelId: editingSalesChannel.id,
      data: values,
    });
    setEditingSalesChannel(null);
  }

  async function handleDeactivateSalesChannel(salesChannel: SalesChannel) {
    setPendingSalesChannelId(salesChannel.id);
    setPendingAction("deactivate");

    try {
      await deactivateSalesChannelMutation.mutateAsync(salesChannel.id);
    } finally {
      setPendingSalesChannelId(null);
      setPendingAction(null);
    }
  }

  async function handleReactivateSalesChannel(salesChannel: SalesChannel) {
    setPendingSalesChannelId(salesChannel.id);
    setPendingAction("reactivate");

    try {
      await reactivateSalesChannelMutation.mutateAsync(salesChannel.id);
    } finally {
      setPendingSalesChannelId(null);
      setPendingAction(null);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Catalogo"
        title="Canales de venta"
        description="Organiza dónde vendes y configura los impuestos, comisiones y recargos de cada canal."
        actions={
          canMutate ? (
            <Button type="button" onClick={() => setIsCreateOpen(true)}>
              <Plus data-icon="inline-start" />
              Nuevo canal
            </Button>
          ) : null
        }
      />

      {!salesChannelsQuery.isLoading && !salesChannelsQuery.error ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card size="sm">
            <CardContent className="flex items-center gap-3">
              <span className="rounded-lg bg-primary/10 p-2 text-primary">
                <Store aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-semibold">{channelCounts.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex items-center gap-3">
              <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                <CircleCheck aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-semibold">{channelCounts.active}</p>
              </div>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex items-center gap-3">
              <span className="rounded-lg bg-muted p-2 text-muted-foreground">
                <CircleOff aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Inactivos</p>
                <p className="text-2xl font-semibold">
                  {channelCounts.inactive}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">Listado de canales</p>
              <p className="text-sm text-muted-foreground">
                Selecciona un estado para acotar los resultados.
              </p>
            </div>
            <div
              className="flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Filtrar canales por estado"
            >
              <Button
                type="button"
                size="sm"
                variant={filter === "all" ? "default" : "outline"}
                aria-pressed={filter === "all"}
                onClick={() => {
                  setFilter("all");
                  setOffset(0);
                }}
              >
                Todos ({channelCounts.total})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={filter === "active" ? "default" : "outline"}
                aria-pressed={filter === "active"}
                onClick={() => {
                  setFilter("active");
                  setOffset(0);
                }}
              >
                Activos ({channelCounts.active})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={filter === "inactive" ? "default" : "outline"}
                aria-pressed={filter === "inactive"}
                onClick={() => {
                  setFilter("inactive");
                  setOffset(0);
                }}
              >
                Inactivos ({channelCounts.inactive})
              </Button>
            </div>
          </div>

          {salesChannelsQuery.isLoading ? (
            <LoadingState
              title="Cargando canales"
              message="Estamos consultando los canales de venta disponibles."
              className="w-full max-w-none shadow-none"
            />
          ) : null}
          {!salesChannelsQuery.error ? (
            <PaginationControls
              offset={offset}
              limit={DEFAULT_PAGE_LIMIT}
              itemCount={salesChannels.length}
              onOffsetChange={setOffset}
              disabled={salesChannelsQuery.isFetching}
            />
          ) : null}

          {salesChannelsQuery.error ? (
            <ErrorMessage
              variant={isForbiddenQuery ? "forbidden" : "general"}
              title={
                isForbiddenQuery
                  ? "Acceso restringido"
                  : "No se pudo cargar el listado"
              }
              messages={queryMessages}
            />
          ) : null}

          {!salesChannelsQuery.isLoading &&
          !salesChannelsQuery.error &&
          salesChannels.length === 0 ? (
            <EmptyState
              title={
                filter === "all"
                  ? "Sin canales"
                  : `Sin canales ${filter === "active" ? "activos" : "inactivos"}`
              }
              message={
                filter === "all"
                  ? "Crea el primer canal para comenzar a configurar tus formas de venta."
                  : "No hay resultados para este filtro. Prueba seleccionando otro estado."
              }
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {!salesChannelsQuery.isLoading &&
          !salesChannelsQuery.error &&
          salesChannels.length > 0 ? (
            <SalesChannelTable
              salesChannels={salesChannels}
              canMutate={canMutate}
              onEdit={setEditingSalesChannel}
              onDeactivate={handleDeactivateSalesChannel}
              onReactivate={handleReactivateSalesChannel}
              pendingSalesChannelId={pendingSalesChannelId}
              pendingAction={pendingAction}
            />
          ) : null}
        </CardContent>
      </Card>

      <SalesChannelForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Nuevo canal de venta"
        description="Crea un canal operativo y configura sus impuestos, comisiones o recargos."
        submitLabel="Crear canal"
        isPending={createSalesChannelMutation.isPending}
        error={createSalesChannelMutation.error}
        onSubmit={handleCreateSalesChannel}
      />

      <SalesChannelForm
        open={Boolean(editingSalesChannel)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSalesChannel(null);
          }
        }}
        title="Editar canal de venta"
        description="Actualiza el identificador operativo y la configuracion visible del canal."
        submitLabel="Guardar cambios"
        initialValues={
          editingSalesChannel
            ? {
                name: editingSalesChannel.name,
                code: editingSalesChannel.code,
                description: editingSalesChannel.description ?? undefined,
                subTaxes: (editingSalesChannel.subTaxes ?? []).map(
                  (subTax) => ({
                    name: subTax.name,
                    percentage: subTax.percentage,
                  })
                ),
              }
            : undefined
        }
        isPending={updateSalesChannelMutation.isPending}
        error={updateSalesChannelMutation.error}
        onSubmit={handleUpdateSalesChannel}
      />
    </section>
  );
}
