"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { VersionCreatedMessage } from "@/components/feedback/version-created-message";
import { normalizeDecimalInput } from "@/lib/money";
import type { CreateProductPriceInput } from "@/features/products/prices/types/product-price.types";
import type { CurrentProductCost } from "@/features/products/costs/types/product-cost.types";
import type { SelectableSalesChannel } from "@/features/products/prices/components/sales-channel-selector";
import { calculateChannelPrice } from "@/features/products/prices/utils/price-adjustments";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { formatMoney } from "@/lib/money";
import { formatCommissionType } from "@/lib/formatters";

function isValidDecimalString(value: string) {
  return /^\d+(\.\d+)?$/.test(value);
}

const baseProductPriceSchema = z.object({
  price: z
    .string()
    .trim()
    .min(1, "El precio base es obligatorio.")
    .transform((value) => normalizeDecimalInput(value))
    .refine((value) => value.length > 0 && isValidDecimalString(value), {
      message: "Ingresa un decimal valido.",
    })
    .refine((value) => Number(value) >= 0, {
      message: "El precio base debe ser mayor o igual a 0.",
    }),
});

type CreatePriceVersionFormValues = z.input<typeof baseProductPriceSchema>;
type CreatePriceVersionFormSubmitValues = z.output<typeof baseProductPriceSchema>;

type CreatePriceVersionFormProps = {
  channels: SelectableSalesChannel[];
  currentCost?: CurrentProductCost;
  canSubmit: boolean;
  isPending?: boolean;
  error?: unknown;
  successMessage?: string;
  onSubmit: (values: CreateProductPriceInput[]) => Promise<void> | void;
};

export function CreatePriceVersionForm({
  channels,
  currentCost,
  canSubmit,
  isPending = false,
  error,
  successMessage,
  onSubmit,
}: CreatePriceVersionFormProps) {
  const form = useForm<
    CreatePriceVersionFormValues,
    undefined,
    CreatePriceVersionFormSubmitValues
  >({
    resolver: zodResolver(baseProductPriceSchema),
    defaultValues: {
      price: "",
    },
  });

  useEffect(() => {
    form.reset({
      price: "",
    });
  }, [form]);

  async function handleSubmit(values: CreatePriceVersionFormSubmitValues) {
    await onSubmit(
      activeChannels.map((channel) => ({
        salesChannelId: channel.id,
        price: calculateChannelPrice(values.price, channel),
      }))
    );
    form.reset({
      price: "",
    });
  }

  const basePrice = form.watch("price");
  const normalizedBasePrice = normalizeDecimalInput(basePrice);
  const canPreview = isValidDecimalString(normalizedBasePrice);
  const activeChannels = channels.filter((channel) => channel.active);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar precio base</CardTitle>
      </CardHeader>
      <CardContent>
        {!canSubmit ? (
          <EmptyState
            title="Solo lectura"
            message="Tu rol puede consultar precios vigentes e historial, pero no editar el precio de venta."
            className="w-full max-w-none shadow-none"
          />
        ) : activeChannels.length === 0 ? (
          <EmptyState
            title="Sin canales activos"
            message="Necesitas al menos un canal activo para crear precios de venta."
            className="w-full max-w-none shadow-none"
          />
        ) : (
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Canales activos
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {activeChannels.length}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Costo actual
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {currentCost ? formatMoney(currentCost.cost) : "Sin costo"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-price">Nuevo precio base</Label>
              <Input
                id="product-price"
                inputMode="decimal"
                placeholder="Ej. 5999.99"
                disabled={isPending}
                aria-invalid={Boolean(form.formState.errors.price)}
                {...form.register("price")}
              />
              {form.formState.errors.price ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.price.message}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Al guardar, este valor queda como precio sin ajuste para canales sin comision y como base para calcular los canales con porcentaje o monto fijo.
                </p>
              )}
            </div>

            <div className="overflow-hidden rounded-lg border">
              <div className="grid grid-cols-[1fr_auto] gap-3 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
                <span>Canal</span>
                <span>Precio final</span>
              </div>
              <div className="divide-y">
                {activeChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{channel.name}</p>
                      <p className="text-muted-foreground">
                        {formatCommissionType(channel.commissionType)}{" "}
                        {channel.commissionType === "NONE"
                          ? "0"
                          : channel.commissionValue}
                      </p>
                    </div>
                    <p className="font-medium">
                      {canPreview
                        ? formatMoney(calculateChannelPrice(normalizedBasePrice, channel))
                        : "-"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {error ? (
              <ErrorMessage
                title="No se pudieron guardar los precios"
                messages={getApiErrorMessages(error)}
              />
            ) : null}

            {successMessage ? (
              <VersionCreatedMessage message={successMessage} />
            ) : null}

            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar precios derivados"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
