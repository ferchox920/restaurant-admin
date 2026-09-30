import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditActionBadge } from "@/features/audit/components/audit-action-badge";
import { AuditEntityBadge } from "@/features/audit/components/audit-entity-badge";
import type { AuditLog } from "@/features/audit/types/audit-log.types";
import {
  formatAuditAction,
  formatAuditActor,
  formatAuditEntityType,
} from "@/features/audit/utils/format-audit-data";
import { formatDateTime } from "@/lib/formatters";

type AuditLogSummaryProps = {
  log: AuditLog;
};

export function AuditLogSummary({ log }: AuditLogSummaryProps) {
  return (
    <Card>
      <CardHeader className="gap-3">
        <CardTitle className="flex flex-wrap items-center justify-between gap-3">
          <span>Registro de auditoria</span>
          <div className="flex flex-wrap items-center gap-2">
            <AuditActionBadge action={log.action} />
            <AuditEntityBadge entityType={log.entityType} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            ID del log
          </p>
          <p className="break-all">{log.id}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Fecha</p>
          <p>{formatDateTime(log.createdAt)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Actor</p>
          <p>{formatAuditActor(log.userId)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Accion</p>
          <p>{formatAuditAction(log.action)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Entidad</p>
          <p>{formatAuditEntityType(log.entityType)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Entity ID</p>
          <p>{log.entityId ?? "No disponible"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
