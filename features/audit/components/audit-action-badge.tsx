import { Badge } from "@/components/ui/badge";
import { formatAuditAction } from "@/features/audit/utils/format-audit-data";
import type { AuditAction } from "@/features/audit/types/audit-log.types";

export function AuditActionBadge({ action }: { action: AuditAction }) {
  return (
    <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
      {formatAuditAction(action)}
    </Badge>
  );
}
