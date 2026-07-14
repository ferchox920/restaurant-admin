import { Badge } from "@/components/ui/badge";
import type { TableStatus } from "@/features/tables/types/table.types";

const labels: Record<TableStatus, string> = {
  AVAILABLE: "Disponible",
  OCCUPIED: "Ocupada",
  INACTIVE: "Inactiva",
};

const variants: Record<TableStatus, "default" | "secondary" | "destructive"> = {
  AVAILABLE: "default",
  OCCUPIED: "secondary",
  INACTIVE: "destructive",
};

export function TableStatusBadge({ status }: { status: TableStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
