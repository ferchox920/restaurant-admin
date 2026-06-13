import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/features/users/types/user.types";

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  CASHIER: "Cashier",
  AUDITOR: "Auditor",
};

const roleStyles: Record<UserRole, string> = {
  ADMIN:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  MANAGER:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
  CASHIER:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  AUDITOR:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
};

export function UserRoleBadge({ role }: { role: UserRole }) {
  return (
    <Badge variant="outline" className={roleStyles[role]}>
      {roleLabels[role]}
    </Badge>
  );
}
