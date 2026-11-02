"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { CreditCard, RefreshCw, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import {
  useCreateMercadoPagoOrder,
  useMercadoPagoOrders,
  useRefreshMercadoPagoOrder,
} from "@/features/mercado-pago/hooks/use-mercado-pago-orders";
import type { MercadoPagoCardPaymentInput } from "@/features/mercado-pago/types/mercado-pago-order.types";
import {
  isMercadoPagoOrderApproved,
  isMercadoPagoOrderRetryable,
} from "@/features/mercado-pago/types/mercado-pago-order.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { mercadoPagoPublicKey } from "@/lib/env";
import { formatMoney } from "@/lib/money";

const MercadoPagoCardForm = dynamic(
  () =>
    import("@/features/mercado-pago/components/mercado-pago-card-form").then(
      (module) => module.MercadoPagoCardForm,
    ),
  {
    ssr: false,
    loading: () => (
      <LoadingState
        title="Cargando pago seguro"
        message="Estamos preparando el formulario de Mercado Pago."
        className="w-full max-w-none shadow-none"
      />
    ),
  },
);

type MercadoPagoCheckoutDialogProps = {
  ticketId: string;
  total: string;
  itemsCount: number;
  disabled?: boolean;
};

function getOrderMessage(status: string, statusDetail: string | null) {
  return statusDetail ? `${status} · ${statusDetail}` : status;
}

export function MercadoPagoCheckoutDialog({
  ticketId,
  total,
  itemsCount,
  disabled = false,
}: MercadoPagoCheckoutDialogProps) {
  const [open, setOpen] = useState(false);
  const amount = Number(total);
  const hasValidAmount = Number.isFinite(amount) && amount > 0;
  const ordersQuery = useMercadoPagoOrders(ticketId, open);
  const createOrder = useCreateMercadoPagoOrder(ticketId);
  const refreshOrder = useRefreshMercadoPagoOrder(ticketId);
  const latestOrder = createOrder.data ?? ordersQuery.data?.[0];
  const approved = latestOrder
    ? isMercadoPagoOrderApproved(latestOrder)
    : false;
  const retryable = latestOrder
    ? isMercadoPagoOrderRetryable(latestOrder)
    : false;
  const canRenderForm =
    Boolean(mercadoPagoPublicKey) &&
    hasValidAmount &&
    !ordersQuery.isLoading &&
    (!latestOrder || retryable);
  const triggerDisabled = disabled || itemsCount === 0 || !hasValidAmount;
  const orderMessage = useMemo(
    () =>
      latestOrder
        ? getOrderMessage(latestOrder.status, latestOrder.statusDetail)
        : null,
    [latestOrder],
  );

  async function handleSubmit(payload: MercadoPagoCardPaymentInput) {
    await createOrder.mutateAsync({
      payload,
      idempotencyKey: crypto.randomUUID(),
    });
  }

  return (
    <div className="space-y-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="w-full border-sky-400/60 bg-sky-50 text-sky-800 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-200"
              disabled={triggerDisabled}
            />
          }
        >
          <CreditCard aria-hidden="true" />
          Cobrar con Mercado Pago
        </DialogTrigger>

        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Cobro con Mercado Pago</DialogTitle>
            <DialogDescription>
              Total del ticket: {formatMoney(total)}. Los datos de la tarjeta se
              capturan en el formulario seguro de Mercado Pago.
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <ShieldCheck aria-hidden="true" />
            <AlertTitle>Pago protegido</AlertTitle>
            <AlertDescription>
              El panel recibe solamente un token de un solo uso; no almacena el
              numero de tarjeta ni el codigo de seguridad.
            </AlertDescription>
          </Alert>

          {!mercadoPagoPublicKey ? (
            <Alert variant="destructive">
              <AlertTitle>Falta configurar la clave publica</AlertTitle>
              <AlertDescription>
                Agrega NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY al entorno del
                frontend para habilitar el formulario.
              </AlertDescription>
            </Alert>
          ) : null}

          {ordersQuery.isLoading ? (
            <LoadingState
              title="Revisando el estado del cobro"
              message="Estamos comprobando si el ticket ya tiene una orden."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {ordersQuery.error ? (
            <ErrorMessage
              title="No se pudo consultar el estado de Mercado Pago"
              messages={getApiErrorMessages(ordersQuery.error)}
            />
          ) : null}

          {latestOrder && !retryable ? (
            <Alert>
              <AlertTitle>
                {approved ? "Pago acreditado" : "Pago en proceso"}
              </AlertTitle>
              <AlertDescription>
                Estado: {orderMessage}. Referencia:{" "}
                {latestOrder.externalOrderId}.
                {latestOrder.reconciliationError
                  ? ` ${latestOrder.reconciliationError}`
                  : ""}
              </AlertDescription>
            </Alert>
          ) : null}

          {latestOrder && retryable ? (
            <Alert variant="destructive">
              <AlertTitle>El intento anterior no fue aprobado</AlertTitle>
              <AlertDescription>
                Estado: {orderMessage}. Puedes completar nuevamente el
                formulario para generar un nuevo intento.
              </AlertDescription>
            </Alert>
          ) : null}

          {createOrder.error ? (
            <ErrorMessage
              title="No se pudo procesar el cobro"
              messages={getApiErrorMessages(createOrder.error)}
            />
          ) : null}

          {refreshOrder.error ? (
            <ErrorMessage
              title="No se pudo actualizar el estado"
              messages={getApiErrorMessages(refreshOrder.error)}
            />
          ) : null}

          {canRenderForm ? (
            <MercadoPagoCardForm
              publicKey={mercadoPagoPublicKey}
              amount={amount}
              ticketId={ticketId}
              onSubmit={handleSubmit}
            />
          ) : null}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cerrar
            </DialogClose>
            {latestOrder && !approved && !retryable ? (
              <Button
                type="button"
                disabled={refreshOrder.isPending}
                onClick={() => refreshOrder.mutate(latestOrder.id)}
              >
                <RefreshCw aria-hidden="true" />
                {refreshOrder.isPending
                  ? "Actualizando..."
                  : "Actualizar estado"}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {itemsCount === 0 ? (
        <p className="text-sm text-muted-foreground">
          Agrega productos para habilitar el cobro con tarjeta.
        </p>
      ) : null}
    </div>
  );
}
