import { StatusBadge } from "@/components/common/status-badge";
import type { ReportStockStatus } from "@/features/reports/types/report.types";
import { getStockReportStatus } from "@/features/reports/utils/report-formatters";

export function ReportStockStatusBadge({
  status,
}: {
  status: ReportStockStatus;
}) {
  const config = getStockReportStatus(status);

  return <StatusBadge status={config.tone} label={config.label} />;
}
