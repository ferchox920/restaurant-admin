"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { InventoryMovementTable } from "@/features/inventory/components/inventory-movement-table";
import { MovementFilters } from "@/features/inventory/components/movement-filters";
import { useProductInventoryMovements } from "@/features/inventory/hooks/use-product-inventory-movements";
import type {
  InventoryMovementType,
  InventoryMovementsFilters,
} from "@/features/inventory/types/inventory.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { PaginationControls } from "@/components/common/pagination-controls";
import { DEFAULT_PAGE_LIMIT } from "@/lib/api/pagination";
import { isValidDateRange, toIsoDateBoundary } from "@/lib/api/date-range";

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
  const [offset, setOffset] = useState(0);
  const validRange = isValidDateRange(from, to);

  const deferredFilters: InventoryMovementsFilters = {
    movementType,
    from: validRange ? toIsoDateBoundary(from, "start") : undefined,
    to: validRange ? toIsoDateBoundary(to, "end") : undefined,
    limit: DEFAULT_PAGE_LIMIT,
    offset,
  };
  const movementsQuery = useProductInventoryMovements(
    canRead ? productId : undefined,
    deferredFilters,
    validRange
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
          Tu rol puede consultar stock actual, pero no el historial de
          movimientos.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimientos del producto</CardTitle>
        <p className="text-sm text-muted-foreground">
          Consulta ingresos, salidas, ajustes y reversiones de stock.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <MovementFilters
          movementType={movementType}
          from={from}
          to={to}
          onMovementTypeChange={(value) => {
            setMovementType(value);
            setOffset(0);
          }}
          onFromChange={(value) => {
            setFrom(value);
            setOffset(0);
            if (to && value > to) setTo("");
          }}
          onToChange={(value) => {
            setTo(value);
            setOffset(0);
          }}
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

        {!movementsQuery.isLoading && !movementsQuery.error ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {(movementsQuery.data ?? []).length}{" "}
            {(movementsQuery.data ?? []).length === 1
              ? "movimiento encontrado"
              : "movimientos encontrados"}
          </p>
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
          <InventoryMovementTable movements={movementsQuery.data ?? []} />
        ) : null}
        {!movementsQuery.error && validRange ? (
          <PaginationControls
            offset={offset}
            limit={DEFAULT_PAGE_LIMIT}
            itemCount={movementsQuery.data?.length ?? 0}
            onOffsetChange={setOffset}
            disabled={movementsQuery.isFetching}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
