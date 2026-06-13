"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditLogFilters } from "@/features/audit/components/audit-log-filters";
import { AuditLogTable } from "@/features/audit/components/audit-log-table";
import { useAuditLogs } from "@/features/audit/hooks/use-audit-logs";
import { auditLogFiltersSchema } from "@/features/audit/schemas/audit-log-filters.schema";
import type { AuditLogFilters as AuditFilters, AuditAction, AuditEntityType } from "@/features/audit/types/audit-log.types";
import { toReportDateRange } from "@/features/reports/utils/report-formatters";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";

const DEFAULT_LIMIT = "50";
const DEFAULT_OFFSET = 0;

function isValidDateInputValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function AuditLogsPage() {
  const { user } = useAuth();
  const canUseActorSelector = user?.role === "ADMIN";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const action = (searchParams.get("action") ?? "__all__") as AuditAction | "__all__";
  const entityType = (searchParams.get("entityType") ?? "__all__") as
    | AuditEntityType
    | "__all__";
  const entityId = searchParams.get("entityId") ?? "";
  const userId = searchParams.get("userId") ?? "";
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");
  const parsedLimit = Number(limitParam);
  const parsedOffset = Number(offsetParam);
  const limit =
    limitParam && Number.isInteger(parsedLimit) && parsedLimit >= 1 && parsedLimit <= 100
      ? parsedLimit
      : Number(DEFAULT_LIMIT);
  const offset =
    offsetParam && Number.isInteger(parsedOffset) && parsedOffset >= 0
      ? parsedOffset
      : DEFAULT_OFFSET;
  const hasInvalidDateInput =
    (from.length > 0 && !isValidDateInputValue(from)) ||
    (to.length > 0 && !isValidDateInputValue(to));

  function replaceSearchParams(
    updates: Record<string, string | undefined>,
    options?: { resetOffset?: boolean }
  ) {
    const nextParams = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "__all__") {
        nextParams.delete(key);
        return;
      }

      nextParams.set(key, value);
    });

    if (options?.resetOffset) {
      nextParams.delete("offset");
    }

    const queryString = nextParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  const filters = useMemo<AuditFilters>(
    () => ({
      ...(hasInvalidDateInput
        ? { from: "__invalid__", to: "__invalid__" }
        : toReportDateRange({ from, to })),
      action: action === "__all__" ? undefined : action,
      entityType: entityType === "__all__" ? undefined : entityType,
      entityId: entityId.trim() || undefined,
      userId: userId.trim() || undefined,
      limit,
      offset,
    }),
    [action, entityId, entityType, from, hasInvalidDateInput, limit, offset, to, userId]
  );

  const validation = auditLogFiltersSchema.safeParse(filters);
  const canRenderAuditState = validation.success && !hasInvalidDateInput;
  const logsQuery = useAuditLogs(filters);
  const isForbidden =
    logsQuery.error &&
    isApiError(logsQuery.error) &&
    logsQuery.error.statusCode === HTTP_STATUS.forbidden;
  const items = logsQuery.data ?? [];
  const canGoBack = offset > 0;
  const canGoNext = items.length === limit;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Auditoria"
        title="Registros de auditoria"
        description="Consulta de trazabilidad general con filtros reales del backend."
      />

      <Card>
        <CardHeader>
          <CardTitle>Listado de registros de auditoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuditLogFilters
            values={{
              from,
              to,
              action,
              entityType,
              entityId,
              userId,
              limit: String(limit),
              allowActorSelector: canUseActorSelector,
            }}
            onFromChange={(value) => replaceSearchParams({ from: value || undefined }, { resetOffset: true })}
            onToChange={(value) => replaceSearchParams({ to: value || undefined }, { resetOffset: true })}
            onActionChange={(value) => replaceSearchParams({ action: value }, { resetOffset: true })}
            onEntityTypeChange={(value) => replaceSearchParams({ entityType: value }, { resetOffset: true })}
            onEntityIdChange={(value) => replaceSearchParams({ entityId: value.trim() || undefined }, { resetOffset: true })}
            onUserIdChange={(value) => replaceSearchParams({ userId: value.trim() || undefined }, { resetOffset: true })}
            onLimitChange={(value) =>
              replaceSearchParams(
                {
                  limit:
                    Number.isInteger(Number(value)) &&
                    Number(value) >= 1 &&
                    Number(value) <= 100
                      ? value
                      : value.length === 0
                        ? undefined
                        : value,
                },
                { resetOffset: true }
              )
            }
            onReset={() => router.replace(pathname, { scroll: false })}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-border px-3 py-1">
              Solo lectura
            </Badge>
            <Badge variant="outline" className="border-border px-3 py-1">
              Selector solo para ADMIN
            </Badge>
            <Badge variant="outline" className="border-border px-3 py-1">
              Sin total real
            </Badge>
            <Badge variant="outline" className="border-border px-3 py-1">
              Offset y limit reales
            </Badge>
          </div>

          {!validation.success || hasInvalidDateInput ? (
            <ErrorMessage
              title="Filtros invalidos"
              messages={
                hasInvalidDateInput
                  ? ["Las fechas en la URL deben usar el formato YYYY-MM-DD."]
                  : validation.success
                    ? []
                    : validation.error.issues.map((issue) => issue.message)
              }
            />
          ) : null}

          {canRenderAuditState && logsQuery.isLoading ? (
            <LoadingState
              title="Cargando auditoria"
              message="Estamos consultando los eventos de auditoria."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {canRenderAuditState && logsQuery.error ? (
            <ErrorMessage
              variant={isForbidden ? "forbidden" : "general"}
              title={isForbidden ? "Acceso restringido" : "No se pudo cargar la auditoria"}
              messages={getApiErrorMessages(logsQuery.error)}
            />
          ) : null}

          {canRenderAuditState && !logsQuery.isLoading && !logsQuery.error && items.length === 0 ? (
            <EmptyState
              title="Sin eventos"
              message="No hay registros de auditoria para los filtros seleccionados."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {canRenderAuditState && !logsQuery.isLoading && !logsQuery.error && items.length > 0 ? (
            <>
              <AuditLogTable items={items} />
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                  <p>Mostrando {items.length} eventos.</p>
                  <p>
                    Offset {offset} · Limite {limit}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm disabled:pointer-events-none disabled:opacity-50"
                    disabled={!canGoBack}
                    onClick={() =>
                      replaceSearchParams({
                        offset: String(Math.max(DEFAULT_OFFSET, offset - limit)),
                      })
                    }
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm disabled:pointer-events-none disabled:opacity-50"
                    disabled={!canGoNext}
                    onClick={() =>
                      replaceSearchParams({
                        offset: String(offset + limit),
                      })
                    }
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
