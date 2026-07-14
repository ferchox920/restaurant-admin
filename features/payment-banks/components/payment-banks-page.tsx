"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/common/page-header";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { usePaymentBanks } from "@/features/payment-banks/hooks/use-payment-banks";
import { useCreatePaymentBank } from "@/features/payment-banks/hooks/use-create-payment-bank";
import { useUpdatePaymentBank } from "@/features/payment-banks/hooks/use-update-payment-bank";
import { useDeactivatePaymentBank } from "@/features/payment-banks/hooks/use-deactivate-payment-bank";
import { useReactivatePaymentBank } from "@/features/payment-banks/hooks/use-reactivate-payment-bank";
import { PaymentBankForm } from "@/features/payment-banks/components/payment-bank-form";
import { PaymentBankTable } from "@/features/payment-banks/components/payment-bank-table";
import type { PaymentBank } from "@/features/payment-banks/types/payment-bank.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { PaginationControls } from "@/components/common/pagination-controls";
import { DEFAULT_PAGE_LIMIT } from "@/lib/api/pagination";

type PaymentBankFilterValue = "all" | "active" | "inactive";

const filterToActiveMap: Record<PaymentBankFilterValue, boolean | undefined> = {
  all: undefined,
  active: true,
  inactive: false,
};

export function PaymentBanksPage() {
  const { user } = useAuth();
  const canMutate = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [filter, setFilter] = useState<PaymentBankFilterValue>("all");
  const [offset, setOffset] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPaymentBank, setEditingPaymentBank] =
    useState<PaymentBank | null>(null);
  const [pendingPaymentBankId, setPendingPaymentBankId] = useState<
    string | null
  >(null);
  const [pendingAction, setPendingAction] = useState<
    "deactivate" | "reactivate" | null
  >(null);

  const paymentBanksQuery = usePaymentBanks({
    active: filterToActiveMap[filter],
    limit: DEFAULT_PAGE_LIMIT,
    offset,
  });
  const createPaymentBankMutation = useCreatePaymentBank();
  const updatePaymentBankMutation = useUpdatePaymentBank();
  const deactivatePaymentBankMutation = useDeactivatePaymentBank();
  const reactivatePaymentBankMutation = useReactivatePaymentBank();

  const paymentBanks = paymentBanksQuery.data ?? [];

  const queryMessages = paymentBanksQuery.error
    ? getApiErrorMessages(paymentBanksQuery.error)
    : [];
  const isForbiddenQuery =
    paymentBanksQuery.error &&
    isApiError(paymentBanksQuery.error) &&
    paymentBanksQuery.error.statusCode === HTTP_STATUS.forbidden;

  async function handleCreatePaymentBank(values: {
    name: string;
    description?: string;
  }) {
    await createPaymentBankMutation.mutateAsync(values);
    setIsCreateOpen(false);
  }

  async function handleUpdatePaymentBank(values: {
    name?: string;
    description?: string;
  }) {
    if (!editingPaymentBank) {
      return;
    }

    await updatePaymentBankMutation.mutateAsync({
      paymentBankId: editingPaymentBank.id,
      data: values,
    });
    setEditingPaymentBank(null);
  }

  async function handleDeactivatePaymentBank(paymentBank: PaymentBank) {
    setPendingPaymentBankId(paymentBank.id);
    setPendingAction("deactivate");

    try {
      await deactivatePaymentBankMutation.mutateAsync(paymentBank.id);
    } finally {
      setPendingPaymentBankId(null);
      setPendingAction(null);
    }
  }

  async function handleReactivatePaymentBank(paymentBank: PaymentBank) {
    setPendingPaymentBankId(paymentBank.id);
    setPendingAction("reactivate");

    try {
      await reactivatePaymentBankMutation.mutateAsync(paymentBank.id);
    } finally {
      setPendingPaymentBankId(null);
      setPendingAction(null);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Pagos"
        title="Bancos"
        description="Administra los bancos disponibles para registrar transferencias en ventas."
        actions={
          canMutate ? (
            <Button type="button" onClick={() => setIsCreateOpen(true)}>
              <Plus data-icon="inline-start" />
              Nuevo banco
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
              onClick={() => { setFilter("all"); setOffset(0); }}
            >
              Todos
            </Button>
            <Button
              type="button"
              variant={filter === "active" ? "default" : "outline"}
              onClick={() => { setFilter("active"); setOffset(0); }}
            >
              Activos
            </Button>
            <Button
              type="button"
              variant={filter === "inactive" ? "default" : "outline"}
              onClick={() => { setFilter("inactive"); setOffset(0); }}
            >
              Inactivos
            </Button>
          </div>

          {paymentBanksQuery.isLoading ? (
            <LoadingState
              title="Cargando bancos"
              message="Estamos consultando los bancos configurados."
              className="w-full max-w-none shadow-none"
            />
          ) : null}
          {!paymentBanksQuery.error ? (
            <PaginationControls offset={offset} limit={DEFAULT_PAGE_LIMIT} itemCount={paymentBanks.length} onOffsetChange={setOffset} disabled={paymentBanksQuery.isFetching} />
          ) : null}

          {paymentBanksQuery.error ? (
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

          {!paymentBanksQuery.isLoading &&
          !paymentBanksQuery.error &&
          paymentBanks.length === 0 ? (
            <EmptyState
              title="Sin bancos"
              message="Todavia no hay bancos para mostrar con el filtro seleccionado."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {!paymentBanksQuery.isLoading &&
          !paymentBanksQuery.error &&
          paymentBanks.length > 0 ? (
            <PaymentBankTable
              paymentBanks={paymentBanks}
              canMutate={canMutate}
              onEdit={setEditingPaymentBank}
              onDeactivate={handleDeactivatePaymentBank}
              onReactivate={handleReactivatePaymentBank}
              pendingPaymentBankId={pendingPaymentBankId}
              pendingAction={pendingAction}
            />
          ) : null}
        </CardContent>
      </Card>

      <PaymentBankForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Nuevo banco"
        description="Crea un banco activo para usarlo como destino de transferencias."
        submitLabel="Crear banco"
        isPending={createPaymentBankMutation.isPending}
        error={createPaymentBankMutation.error}
        onSubmit={handleCreatePaymentBank}
      />

      <PaymentBankForm
        open={Boolean(editingPaymentBank)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPaymentBank(null);
          }
        }}
        title="Editar banco"
        description="Actualiza el nombre o la descripcion visible del banco."
        submitLabel="Guardar cambios"
        initialValues={
          editingPaymentBank
            ? {
                name: editingPaymentBank.name,
                description: editingPaymentBank.description ?? undefined,
              }
            : undefined
        }
        isPending={updatePaymentBankMutation.isPending}
        error={updatePaymentBankMutation.error}
        onSubmit={handleUpdatePaymentBank}
      />
    </section>
  );
}
