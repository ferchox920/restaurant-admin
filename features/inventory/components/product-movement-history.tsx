"use client";

import { useDeferredValue, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { InventoryMovementsTable } from "@/features/inventory/components/inventory-movements-table";
import { MovementFilters } from "@/features/inventory/components/movement-filters";
import { useProductInventoryMovements } from "@/features/inventory/hooks/use-product-inventory-movements";
import type {
  InventoryMovementType,
  InventoryMovementsFilters,
} from "@/features/inventory/types/inventory.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";

export function ProductMovementHistory({
  productId,
  canRead,
}: {
  productId: string;
  canRead: boolean;
}) {
  const [movementType, setMovementType] = useState<
    InventoryMovementType | undefined
  >();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const deferredFilters = useDeferredValue<InventoryMovementsFilters>({
    movementType,
    from: from || undefined,
    to: to || undefined,
  });
  const movementsQuery = useProductInventoryMovements(
    canRead ? productId : undefined,
    deferredFilters
  );
  const isForbidden =
    movementsQuery.error &&
    isApiError(movementsQuery.error) &&
    movementsQuery.error.statusCode === HTTP_STATUS.forbidden;

  if (!canRead) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Movimientos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Tu rol puede consultar stock actual, pero no el historial de movimientos.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimientos del producto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MovementFilters
          movementType={movementType}
          from={from}
          to={to}
          onMovementTypeChange={setMovementType}
          onFromChange={setFrom}
          onToChange={setTo}
        />

        {movementsQuery.isLoading ? (
          <LoadingState
            title="Cargando movimientos"
            message="Estamos consultando la trazabilidad del producto."
            className="w-full max-w-none shadow-none"
          />
        ) : null}

        {movementsQuery.error ? (
          <ErrorMessage
            variant={isForbidden ? "forbidden" : "general"}
            title={
              isForbidden
                ? "Acceso restringido"
                : "No se pudieron cargar los movimientos"
            }
            messages={getApiErrorMessages(movementsQuery.error)}
          />
        ) : null}

        {!movementsQuery.isLoading &&
        !movementsQuery.error &&
        (movementsQuery.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="Sin movimientos"
            message="No hay movimientos para los filtros seleccionados."
            className="w-full max-w-none shadow-none"
          />
        ) : null}

        {!movementsQuery.isLoading &&
        !movementsQuery.error &&
        (movementsQuery.data?.length ?? 0) > 0 ? (
          <InventoryMovementsTable movements={movementsQuery.data ?? []} />
        ) : null}
      </CardContent>
    </Card>
  );
}
