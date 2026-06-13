import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { NoCurrentCostState } from "@/features/products/costs/components/no-current-cost-state";
import type { CurrentProductCost } from "@/features/products/costs/types/product-cost.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { formatDateTime } from "@/lib/formatters";
import { formatMoney } from "@/lib/money";

type CurrentCostCardProps = {
  cost?: CurrentProductCost;
  isLoading: boolean;
  isMissing: boolean;
  error?: unknown;
};

export function CurrentCostCard({
  cost,
  isLoading,
  isMissing,
  error,
}: CurrentCostCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Costo vigente</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState
            title="Cargando costo vigente"
            message="Estamos consultando la version vigente."
            className="w-full max-w-none shadow-none"
          />
        ) : error && !isMissing ? (
          <ErrorMessage
            title="No se pudo cargar el costo vigente"
            messages={getApiErrorMessages(error)}
          />
        ) : isMissing ? (
          <div className="space-y-4">
            <Badge
              variant="outline"
              className="border-rose-200 bg-rose-50 text-rose-700"
            >
              No elegible para venta
            </Badge>
            <NoCurrentCostState />
          </div>
        ) : cost ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Costo</p>
              <p className="text-lg font-medium">{formatMoney(cost.cost)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Vigente desde
              </p>
              <p>{formatDateTime(cost.validFrom)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Creado por
              </p>
              <p>{cost.createdById ?? "-"}</p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
