"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
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
import type { SalesChannel } from "@/features/sales-channels/types/sales-channel.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";

type SalesChannelFilterValue = "all" | "active" | "inactive";

const filterToActiveMap: Record<SalesChannelFilterValue, boolean | undefined> = {
  all: undefined,
  active: true,
  inactive: false,
};

export function SalesChannelsPage() {
  const { user } = useAuth();
  const canMutate = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [filter, setFilter] = useState<SalesChannelFilterValue>("all");
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
    active: filterToActiveMap[filter],
  });
  const createSalesChannelMutation = useCreateSalesChannel();
  const updateSalesChannelMutation = useUpdateSalesChannel();
  const deactivateSalesChannelMutation = useDeactivateSalesChannel();
  const reactivateSalesChannelMutation = useReactivateSalesChannel();

  const salesChannels = useMemo(() => {
    const source = salesChannelsQuery.data ?? [];

    if (filter === "all") {
      return source;
    }

    return source.filter((salesChannel) =>
      filter === "active" ? salesChannel.active : !salesChannel.active
    );
  }, [salesChannelsQuery.data, filter]);

  const queryMessages = salesChannelsQuery.error
    ? getApiErrorMessages(salesChannelsQuery.error)
    : [];
  const isForbiddenQuery =
    salesChannelsQuery.error &&
    isApiError(salesChannelsQuery.error) &&
    salesChannelsQuery.error.statusCode === HTTP_STATUS.forbidden;

  async function handleCreateSalesChannel(values: {
    name: string;
    code: string;
    description?: string;
    commissionType: SalesChannel["commissionType"];
    commissionValue: number;
  }) {
    await createSalesChannelMutation.mutateAsync(values);
    setIsCreateOpen(false);
  }

  async function handleUpdateSalesChannel(values: {
    name?: string;
    code?: string;
    description?: string;
    commissionType?: SalesChannel["commissionType"];
    commissionValue?: number;
  }) {
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
        description="Administra canales comerciales y sus datos operativos sin introducir precios por canal ni logica de ventas."
        actions={
          canMutate ? (
            <Button type="button" onClick={() => setIsCreateOpen(true)}>
              <Plus data-icon="inline-start" />
              Nuevo canal
            </Button>
          ) : null
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              Todos
            </Button>
            <Button
              type="button"
              variant={filter === "active" ? "default" : "outline"}
              onClick={() => setFilter("active")}
            >
              Activos
            </Button>
            <Button
              type="button"
              variant={filter === "inactive" ? "default" : "outline"}
              onClick={() => setFilter("inactive")}
            >
              Inactivos
            </Button>
          </div>

          {salesChannelsQuery.isLoading ? (
            <LoadingState
              title="Cargando canales"
              message="Estamos consultando los canales de venta disponibles."
              className="w-full max-w-none shadow-none"
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
              title="Sin canales"
              message="Todavia no hay canales para mostrar con el filtro seleccionado."
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
        description="Crea un canal operativo basico. La comision es solo un dato descriptivo del catalogo."
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
                commissionType: editingSalesChannel.commissionType,
                commissionValue: editingSalesChannel.commissionValue,
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
