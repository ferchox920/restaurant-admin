"use client";

import type { RestaurantTable } from "@/features/tables/types/table.types";
import { FloorTableCard } from "@/features/tables/components/floor-table-card";
import type { SalesChannel } from "@/features/sales-channels/types/sales-channel.types";
import type { OpenTableOrderFormValues } from "@/features/table-orders/types/table-order.types";

type Props = {
  tables: RestaurantTable[];
  channels: SalesChannel[];
  canOperate: boolean;
  openingTableId?: string | null;
  viewingTableId?: string | null;
  openError?: unknown;
  openErrorTableId?: string | null;
  viewError?: unknown;
  viewErrorTableId?: string | null;
  onOpenOrder: (
    table: RestaurantTable,
    values: OpenTableOrderFormValues
  ) => Promise<void> | void;
  onViewOrder: (table: RestaurantTable) => Promise<void> | void;
};

export function FloorGrid({
  tables,
  channels,
  canOperate,
  openingTableId,
  viewingTableId,
  openError,
  openErrorTableId,
  viewError,
  viewErrorTableId,
  onOpenOrder,
  onViewOrder,
}: Props) {
  const grouped = tables.reduce<Record<string, RestaurantTable[]>>(
    (acc, table) => {
      const key = table.area || "Sin área";
      acc[key] ??= [];
      acc[key].push(table);
      return acc;
    },
    {}
  );
  const areas = Object.entries(grouped)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(
      ([area, items]) =>
        [
          area,
          [...items].sort((left, right) =>
            left.code.localeCompare(right.code, undefined, { numeric: true })
          ),
        ] as const
    );

  return (
    <div className="space-y-8">
      {areas.map(([area, items]) => (
        <section key={area} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">{area}</h2>
              <p className="text-sm text-muted-foreground">
                {items.filter((table) => table.status === "AVAILABLE").length}{" "}
                disponibles ·{" "}
                {items.filter((table) => table.status === "OCCUPIED").length}{" "}
                ocupadas
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "mesa" : "mesas"}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((table) => (
              <FloorTableCard
                key={table.id}
                table={table}
                channels={channels}
                canOperate={canOperate}
                isOpening={openingTableId === table.id}
                isViewing={viewingTableId === table.id}
                openError={
                  openErrorTableId === table.id ? openError : undefined
                }
                viewError={
                  viewErrorTableId === table.id ? viewError : undefined
                }
                onOpenOrder={onOpenOrder}
                onViewOrder={onViewOrder}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
