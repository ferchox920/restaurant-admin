import { Badge } from "@/components/ui/badge";
import type { TableOrderStatus } from "@/features/table-orders/types/table-order.types";

const labels: Record<TableOrderStatus, string> = {
  OPEN: "Orden abierta",
  CANCELLED: "Orden cancelada",
  CLOSED: "Orden cerrada",
};

const variants: Record<TableOrderStatus, "default" | "secondary" | "destructive"> = {
  OPEN: "default",
  CANCELLED: "destructive",
  CLOSED: "secondary",
};

export function TableOrderStatusBadge({ status }: { status: TableOrderStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
