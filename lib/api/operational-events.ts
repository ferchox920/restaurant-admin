import type { QueryClient } from "@tanstack/react-query";
import { inventoryQueryKeys } from "@/features/inventory/query-keys";
import { saleTicketsQueryKeys } from "@/features/sales/query-keys";
import { tablesQueryKeys } from "@/features/tables/query-keys";
import { tableOrdersQueryKeys } from "@/features/table-orders/query-keys";
import { reportsQueryKeys } from "@/features/reports/query-keys";

export type OperationalEventPayload = {
  entityType: string;
  entityId: string;
  version: string;
  related?: {
    restaurantTableId?: string;
    saleTicketId?: string;
    tableOrderId?: string;
    productId?: string;
  };
};
export const operationalKeys = [
  tablesQueryKeys.all,
  tableOrdersQueryKeys.all,
  saleTicketsQueryKeys.all,
  inventoryQueryKeys.all,
  reportsQueryKeys.all,
];

export function invalidateOperationalEvent(
  client: QueryClient,
  name: string,
  payload: OperationalEventPayload
) {
  if (
    !payload ||
    typeof payload.entityId !== "string" ||
    typeof payload.version !== "string"
  )
    throw new Error("Invalid operational event");
  // Closing/voiding changes stock and table availability without dedicated producers.
  operationalKeys.forEach((queryKey) => {
    void client.invalidateQueries({ queryKey, refetchType: "active" });
  });
  if (name === "table-order.changed")
    void client.invalidateQueries({
      queryKey: tableOrdersQueryKeys.detail(payload.entityId),
    });
  if (name === "sale-ticket.changed")
    void client.invalidateQueries({
      queryKey: saleTicketsQueryKeys.detail(payload.entityId),
    });
  if (payload.related?.saleTicketId)
    void client.invalidateQueries({
      queryKey: saleTicketsQueryKeys.detail(payload.related.saleTicketId),
    });
  if (payload.related?.tableOrderId)
    void client.invalidateQueries({
      queryKey: tableOrdersQueryKeys.detail(payload.related.tableOrderId),
    });
}
