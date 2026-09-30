import { Badge } from "@/components/ui/badge";
import { formatAuditEntityType } from "@/features/audit/utils/format-audit-data";
import type { AuditEntityType } from "@/features/audit/types/audit-log.types";

export function AuditEntityBadge({
  entityType,
}: {
  entityType: AuditEntityType;
}) {
  return (
    <Badge
      variant="outline"
      className="border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
    >
      {formatAuditEntityType(entityType)}
    </Badge>
  );
}
