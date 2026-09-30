import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AuditActionBadge } from "@/features/audit/components/audit-action-badge";
import { AuditEntityBadge } from "@/features/audit/components/audit-entity-badge";
import type { AuditLog } from "@/features/audit/types/audit-log.types";
import {
  formatAuditActor,
  formatAuditEntityType,
} from "@/features/audit/utils/format-audit-data";
import { formatDateTime } from "@/lib/formatters";

function getAuditSummary(log: AuditLog) {
  if (log.entityId) {
    return `${formatAuditEntityType(log.entityType)} ${log.entityId}`;
  }

  return formatAuditEntityType(log.entityType);
}

export function AuditLogTable({ items }: { items: AuditLog[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Actor</TableHead>
          <TableHead>Accion</TableHead>
          <TableHead>Entidad</TableHead>
          <TableHead>Entity ID</TableHead>
          <TableHead>Resumen</TableHead>
          <TableHead className="text-right">Detalle</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{formatDateTime(item.createdAt)}</TableCell>
            <TableCell>{formatAuditActor(item.userId)}</TableCell>
            <TableCell>
              <AuditActionBadge action={item.action} />
            </TableCell>
            <TableCell>
              <AuditEntityBadge entityType={item.entityType} />
            </TableCell>
            <TableCell>{item.entityId ?? "-"}</TableCell>
            <TableCell>{getAuditSummary(item)}</TableCell>
            <TableCell className="text-right">
              <Link
                href={`/audit-logs/${item.id}`}
                className="text-sm underline-offset-4 hover:underline"
              >
                Ver registro
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
