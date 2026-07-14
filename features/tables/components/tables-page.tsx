"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CircleCheck, CircleOff, LayoutGrid, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { TableForm } from "@/features/tables/components/table-form";
import { TablesTable } from "@/features/tables/components/tables-table";
import { useCreateTable } from "@/features/tables/hooks/use-create-table";
import { useDeactivateTable } from "@/features/tables/hooks/use-deactivate-table";
import { useReactivateTable } from "@/features/tables/hooks/use-reactivate-table";
import { useTables } from "@/features/tables/hooks/use-tables";
import { useUpdateTable } from "@/features/tables/hooks/use-update-table";
import type { CreateTableInput, RestaurantTable, UpdateTableInput } from "@/features/tables/types/table.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";
import { PaginationControls } from "@/components/common/pagination-controls";
import { DEFAULT_PAGE_LIMIT } from "@/lib/api/pagination";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

type ActiveFilter = "all" | "active" | "inactive";

export function TablesPage() {
  const { user } = useAuth();
  const canMutate = user?.role === "ADMIN" || user?.role === "MANAGER";
  const [active, setActive] = useState<ActiveFilter>("all");
  const [area, setArea] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDebouncedValue(search.trim(), 300);
  const [offset, setOffset] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [pendingTableId, setPendingTableId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"deactivate" | "reactivate" | null>(null);

  const tablesQuery = useTables({
    active: active === "all" ? undefined : active === "active",
    area: area || undefined,
    search: deferredSearch || undefined,
    limit: DEFAULT_PAGE_LIMIT,
    offset,
  });
  const createTableMutation = useCreateTable();
  const updateTableMutation = useUpdateTable();
  const deactivateTableMutation = useDeactivateTable();
  const reactivateTableMutation = useReactivateTable();

  const areas = useMemo(
    () =>
      Array.from(
        new Set(
          (tablesQuery.data ?? []).flatMap((table) =>
            table.area ? [table.area] : []
          )
        )
      ).sort((left, right) => left.localeCompare(right)),
    [tablesQuery.data]
  );
  const tableCounts = useMemo(() => {
    const items = tablesQuery.data ?? [];

    return {
      total: items.length,
      active: items.filter((table) => table.active).length,
      occupied: items.filter((table) => table.status === "OCCUPIED").length,
      inactive: items.filter((table) => !table.active).length,
    };
  }, [tablesQuery.data]);
  const tables = tablesQuery.data ?? [];
  const hasFilters = active !== "all" || Boolean(area || search);
  const isForbidden =
    tablesQuery.error &&
    isApiError(tablesQuery.error) &&
    tablesQuery.error.statusCode === HTTP_STATUS.forbidden;

  async function handleCreate(values: CreateTableInput | UpdateTableInput) {
    await createTableMutation.mutateAsync(values as CreateTableInput);
    setIsCreateOpen(false);
  }

  async function handleUpdate(values: CreateTableInput | UpdateTableInput) {
    if (!editingTable) {
      return;
    }

    await updateTableMutation.mutateAsync({
      tableId: editingTable.id,
      data: values as UpdateTableInput,
    });
    setEditingTable(null);
  }

  async function handleDeactivate(table: RestaurantTable) {
    setPendingTableId(table.id);
    setPendingAction("deactivate");
    try {
      await deactivateTableMutation.mutateAsync(table.id);
    } finally {
      setPendingTableId(null);
      setPendingAction(null);
    }
  }

  async function handleReactivate(table: RestaurantTable) {
    setPendingTableId(table.id);
    setPendingAction("reactivate");
    try {
      await reactivateTableMutation.mutateAsync(table.id);
    } finally {
      setPendingTableId(null);
      setPendingAction(null);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Salon"
        title="Mesas"
        description="Organiza las mesas, sus áreas y capacidades."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              render={<Link href="/floor" />}
              nativeButton={false}
              type="button"
              variant="outline"
            >
              <LayoutGrid aria-hidden="true" />
              Ver salón
            </Button>
            {canMutate ? (
              <Button type="button" onClick={() => setIsCreateOpen(true)}>
                <Plus aria-hidden="true" />
                Nueva mesa
              </Button>
            ) : null}
          </div>
        }
      />

      {!tablesQuery.isLoading && !tablesQuery.error ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card size="sm">
            <CardContent className="flex items-center gap-3">
              <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                <CircleCheck aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Activas</p>
                <p className="text-2xl font-semibold">{tableCounts.active}</p>
              </div>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex items-center gap-3">
              <span className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                <LayoutGrid aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Ocupadas</p>
                <p className="text-2xl font-semibold">{tableCounts.occupied}</p>
              </div>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex items-center gap-3">
              <span className="rounded-lg bg-muted p-2 text-muted-foreground">
                <CircleOff aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Inactivas</p>
                <p className="text-2xl font-semibold">{tableCounts.inactive}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <div className="space-y-2">
              <Label htmlFor="table-search">Buscar mesa</Label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="table-search"
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setOffset(0); }}
                  className="pr-9 pl-9"
                />
                {search ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 right-2 -translate-y-1/2"
                    aria-label="Limpiar búsqueda"
                    onClick={() => { setSearch(""); setOffset(0); }}
                  >
                    <X aria-hidden="true" />
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Área</Label>
              <Select
                value={area || "all"}
                onValueChange={(value) => { setArea(!value || value === "all" ? "" : value); setOffset(0); }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {areas.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 lg:col-span-2">
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Filtrar mesas por estado"
              >
                {([
                  ["all", "Todas", tableCounts.total],
                  ["active", "Activas", tableCounts.active],
                  ["inactive", "Inactivas", tableCounts.inactive],
                ] as const).map(([value, label, count]) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={active === value ? "default" : "outline"}
                    aria-pressed={active === value}
                    onClick={() => { setActive(value); setOffset(0); }}
                  >
                    {label} ({count})
                  </Button>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={!hasFilters}
                onClick={() => {
                  setActive("all");
                  setArea("");
                  setSearch("");
                  setOffset(0);
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>

          {tablesQuery.isLoading ? (
            <LoadingState
              title="Cargando mesas"
              message="Estamos consultando las mesas disponibles."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {tablesQuery.error ? (
            <ErrorMessage
              variant={isForbidden ? "forbidden" : "general"}
              title={isForbidden ? "Acceso restringido" : "No se pudo cargar mesas"}
              messages={getApiErrorMessages(tablesQuery.error)}
            />
          ) : null}

          {!tablesQuery.isLoading && !tablesQuery.error ? (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {tables.length} {tables.length === 1 ? "mesa encontrada" : "mesas encontradas"}
            </p>
          ) : null}

          {!tablesQuery.isLoading &&
          !tablesQuery.error &&
          tables.length === 0 ? (
            <EmptyState
              title={hasFilters ? "Sin coincidencias" : "Sin mesas"}
              message={
                hasFilters
                  ? "No encontramos mesas con los filtros seleccionados."
                  : "Crea la primera mesa para comenzar a organizar el salón."
              }
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {!tablesQuery.isLoading &&
          !tablesQuery.error &&
          tables.length > 0 ? (
            <TablesTable
              tables={tables}
              canMutate={canMutate}
              pendingTableId={pendingTableId}
              pendingAction={pendingAction}
              onEdit={setEditingTable}
              onDeactivate={handleDeactivate}
              onReactivate={handleReactivate}
            />
          ) : null}

          {deactivateTableMutation.error ? (
            <ErrorMessage
              title="No se pudo desactivar la mesa"
              messages={getApiErrorMessages(deactivateTableMutation.error)}
            />
          ) : null}
          {reactivateTableMutation.error ? (
            <ErrorMessage
              title="No se pudo reactivar la mesa"
              messages={getApiErrorMessages(reactivateTableMutation.error)}
            />
          ) : null}
          {!tablesQuery.error ? (
            <PaginationControls offset={offset} limit={DEFAULT_PAGE_LIMIT} itemCount={tables.length} onOffsetChange={setOffset} disabled={tablesQuery.isFetching} />
          ) : null}
        </CardContent>
      </Card>

      <TableForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="create"
        title="Nueva mesa"
        description="Crea una mesa y configura su ubicación y capacidad."
        submitLabel="Crear mesa"
        isPending={createTableMutation.isPending}
        error={createTableMutation.error}
        onSubmit={handleCreate}
      />

      <TableForm
        open={Boolean(editingTable)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTable(null);
          }
        }}
        mode="update"
        title="Editar mesa"
        description="Actualiza el nombre, área o capacidad de la mesa."
        submitLabel="Guardar cambios"
        initialValues={
          editingTable
            ? {
                name: editingTable.name ?? undefined,
                area: editingTable.area ?? undefined,
                capacity: editingTable.capacity ?? undefined,
              }
            : undefined
        }
        isPending={updateTableMutation.isPending}
        error={updateTableMutation.error}
        onSubmit={handleUpdate}
      />
    </section>
  );
}
