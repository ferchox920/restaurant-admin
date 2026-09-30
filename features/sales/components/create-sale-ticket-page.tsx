"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { ForbiddenState } from "@/components/feedback/forbidden-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { CreateSaleTicketForm } from "@/features/sales/components/create-sale-ticket-form";
import { useCreateSaleTicket } from "@/features/sales/hooks/use-create-sale-ticket";
import { useAllSalesChannels as useSalesChannels } from "@/features/sales-channels/hooks/use-all-sales-channels";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";

export function CreateSaleTicketPage() {
  const router = useRouter();
  const { user } = useAuth();
  const canCreate =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "CASHIER";

  const channelsQuery = useSalesChannels({ active: true });
  const createSaleTicketMutation = useCreateSaleTicket();
  const activeChannels =
    channelsQuery.data
      ?.filter((channel) => channel.active)
      .map((channel) => ({
        id: channel.id,
        name: channel.name,
        active: channel.active,
      })) ?? [];

  const isForbiddenQuery =
    channelsQuery.error &&
    isApiError(channelsQuery.error) &&
    channelsQuery.error.statusCode === HTTP_STATUS.forbidden;

  if (!canCreate) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <ForbiddenState />
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        eyebrow="Ventas"
        title="Nueva venta"
        description="Selecciona el canal para iniciar una venta y cargar productos rapidamente."
      />

      <Card>
        <CardHeader>
          <CardTitle>Canal de venta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {channelsQuery.isLoading ? (
            <LoadingState
              title="Cargando canales"
              message="Estamos consultando los canales de venta activos."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {channelsQuery.error ? (
            <ErrorMessage
              variant={isForbiddenQuery ? "forbidden" : "general"}
              title={
                isForbiddenQuery
                  ? "Acceso restringido"
                  : "No se pudieron cargar los canales"
              }
              messages={getApiErrorMessages(channelsQuery.error)}
            />
          ) : null}

          {!channelsQuery.isLoading &&
          !channelsQuery.error &&
          activeChannels.length === 0 ? (
            <EmptyState
              title="Sin canales activos"
              message="No hay canales operativos para crear una venta en este momento."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {!channelsQuery.isLoading &&
          !channelsQuery.error &&
          activeChannels.length > 0 ? (
            <CreateSaleTicketForm
              channels={activeChannels}
              isPending={createSaleTicketMutation.isPending}
              error={createSaleTicketMutation.error}
              onSubmit={async (values) => {
                const ticket =
                  await createSaleTicketMutation.mutateAsync(values);
                router.replace(`/sales/${ticket.id}`);
              }}
            />
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
