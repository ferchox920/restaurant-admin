"use client";

import { Pencil, Power, RotateCcw, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/common/confirm-action-dialog";
import { TableStatusBadge } from "@/features/tables/components/table-status-badge";
import type { RestaurantTable } from "@/features/tables/types/table.types";
import { formatDateTime } from "@/lib/formatters";

type Props = {
  tables: RestaurantTable[];
  canMutate: boolean;
  pendingTableId?: string | null;
  pendingAction?: "deactivate" | "reactivate" | null;
  onEdit: (table: RestaurantTable) => void;
  onDeactivate: (table: RestaurantTable) => Promise<void> | void;
  onReactivate: (table: RestaurantTable) => Promise<void> | void;
};

export function TablesTable({
  tables,
  canMutate,
  pendingTableId,
  pendingAction,
  onEdit,
  onDeactivate,
  onReactivate,
}: Props) {
  return (
    <Table className="min-w-[680px]">
      <TableHeader>
        <TableRow>
          <TableHead>Mesa</TableHead>
          <TableHead>Área y capacidad</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="hidden lg:table-cell">Actualización</TableHead>
          {canMutate ? (
            <TableHead className="text-right">Acciones</TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {tables.map((table) => {
          const isPending = pendingTableId === table.id;

          return (
            <TableRow key={table.id}>
              <TableCell>
                <p className="text-lg font-semibold text-foreground">
                  {table.code}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {table.name || "Sin nombre"}
                </p>
              </TableCell>
              <TableCell>
                <p>{table.area || "Sin área"}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users aria-hidden="true" className="size-3.5" />
                  {table.capacity
                    ? `${table.capacity} personas`
                    : "Sin capacidad definida"}
                </p>
              </TableCell>
              <TableCell>
                <TableStatusBadge
                  status={table.active ? table.status : "INACTIVE"}
                />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {formatDateTime(table.updatedAt)}
              </TableCell>
              {canMutate ? (
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(table)}
                    >
                      <Pencil aria-hidden="true" />
                      Editar
                    </Button>
                    {table.active ? (
                      <ConfirmActionDialog
                        trigger={
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={isPending}
                          >
                            <Power aria-hidden="true" />
                            Desactivar
                          </Button>
                        }
                        title="Desactivar mesa"
                        description={`La mesa ${table.code} dejará de estar disponible para operar.`}
                        confirmLabel="Desactivar"
                        confirmVariant="destructive"
                        isPending={isPending && pendingAction === "deactivate"}
                        onConfirm={() => onDeactivate(table)}
                      />
                    ) : (
                      <ConfirmActionDialog
                        trigger={
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                          >
                            <RotateCcw aria-hidden="true" />
                            Reactivar
                          </Button>
                        }
                        title="Reactivar mesa"
                        description={`La mesa ${table.code} volverá a estar disponible para operar.`}
                        confirmLabel="Reactivar"
                        isPending={isPending && pendingAction === "reactivate"}
                        onConfirm={() => onReactivate(table)}
                      />
                    )}
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
