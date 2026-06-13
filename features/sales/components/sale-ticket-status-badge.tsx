import { Badge } from "@/components/ui/badge";
import type { SaleTicketStatus } from "@/features/sales/constants/sale-ticket-status";
import { getTicketStatusLabel } from "@/features/sales/utils/sale-ticket";

const statusStyles: Record<SaleTicketStatus, string> = {
  DRAFT:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
  CONFIRMED:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  CANCELLED:
    "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300",
  VOIDED:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
};

export function SaleTicketStatusBadge({ status }: { status: SaleTicketStatus }) {
  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {getTicketStatusLabel(status)}
    </Badge>
  );
}
