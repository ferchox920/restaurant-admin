import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { NoCurrentPriceState } from "@/features/products/prices/components/no-current-price-state";
import type { CurrentProductPrice } from "@/features/products/prices/types/product-price.types";
import type { CurrentProductCost } from "@/features/products/costs/types/product-cost.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { formatDateTime } from "@/lib/formatters";
import { formatMoney } from "@/lib/money";
import type { ReactNode } from "react";

type CurrentPriceCardProps = {
  currentPrice?: CurrentProductPrice;
  isLoading: boolean;
  isMissing: boolean;
  error?: unknown;
  selectedChannelName?: string | null;
  channelSelector?: ReactNode;
  createdByName?: string | null;
  currentCost?: CurrentProductCost;
  isCostLoading?: boolean;
  isCostMissing?: boolean;
  costError?: unknown;
};

function parseAmount(value: string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : null;
}

export function CurrentPriceCard({
  currentPrice,
  isLoading,
  isMissing,
  error,
  selectedChannelName,
  channelSelector,
  createdByName,
  currentCost,
  isCostLoading = false,
  isCostMissing = false,
  costError,
}: CurrentPriceCardProps) {
  const priceAmount = parseAmount(currentPrice?.price);
  const costAmount = parseAmount(currentCost?.cost);
  const marginAmount =
    priceAmount !== null && costAmount !== null
      ? priceAmount - costAmount
      : null;
  const marginPercentage =
    marginAmount !== null && priceAmount && priceAmount > 0
      ? (marginAmount / priceAmount) * 100
      : null;
  const isNotSaleEligible = !currentPrice || !currentCost;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Precio y costo vigentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading || isCostLoading ? (
          <LoadingState
            title="Cargando valores vigentes"
            message="Estamos consultando precio de venta y costo actual."
            className="w-full max-w-none shadow-none"
          />
        ) : error && !isMissing ? (
          <ErrorMessage
            title="No se pudo cargar el precio vigente"
            messages={getApiErrorMessages(error)}
          />
        ) : costError && !isCostMissing ? (
          <ErrorMessage
            title="No se pudo cargar el costo vigente"
            messages={getApiErrorMessages(costError)}
          />
        ) : isMissing && !currentCost ? (
          <div className="space-y-4">
            <Badge
              variant="outline"
              className="border-rose-200 bg-rose-50 text-rose-700"
            >
              No elegible para venta
            </Badge>
            {channelSelector ? (
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Canal
                </p>
                <div className="mt-2">{channelSelector}</div>
              </div>
            ) : null}
            <NoCurrentPriceState channelName={selectedChannelName} />
          </div>
        ) : currentPrice ? (
          <>
            {isNotSaleEligible ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-rose-200 bg-white text-rose-700"
                  >
                    No elegible para venta
                  </Badge>
                  <span>
                    Falta completar el costo vigente antes de vender este
                    producto.
                  </span>
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Precio de venta
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatMoney(currentPrice.price)}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Costo vigente
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {currentCost ? formatMoney(currentCost.cost) : "Sin costo"}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Margen estimado
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {marginAmount !== null ? formatMoney(marginAmount) : "-"}
                </p>
                {marginPercentage !== null ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {marginPercentage.toFixed(1)}% sobre venta
                  </p>
                ) : null}
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Canal
                </p>
                <div className="mt-2">
                  {channelSelector ?? (
                    <p className="text-lg font-medium">
                      {currentPrice.salesChannelName ??
                        selectedChannelName ??
                        "Sin canal"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="font-medium text-muted-foreground">
                  Precio desde
                </p>
                <p>{formatDateTime(currentPrice.validFrom)}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Costo desde</p>
                <p>
                  {currentCost ? formatDateTime(currentCost.validFrom) : "-"}
                </p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Creado por</p>
                <p>
                  {createdByName ??
                    (currentPrice.createdById ? "Usuario registrado" : "-")}
                </p>
              </div>
            </div>
          </>
        ) : !currentPrice && currentCost ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-rose-200 bg-white text-rose-700"
                >
                  No elegible para venta
                </Badge>
                <span>
                  Falta definir el precio final para el canal seleccionado.
                </span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Precio de venta
                </p>
                <p className="mt-2 text-2xl font-semibold">Sin precio</p>
                {channelSelector ? (
                  <div className="mt-3">{channelSelector}</div>
                ) : null}
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Costo vigente
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatMoney(currentCost.cost)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Define un precio de venta para el canal seleccionado.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
