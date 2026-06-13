import { UserRoleBadge } from "@/features/users/components/user-role-badge";
import { UserStatusBadge } from "@/features/users/components/user-status-badge";
import type { UserOption } from "@/features/users/types/user-option.types";

export function UserOptionLabel({ option }: { option: UserOption }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{option.label}</span>
        <UserRoleBadge role={option.role} />
        <UserStatusBadge active={option.active} />
      </div>
      <span className="text-xs text-muted-foreground">{option.email}</span>
    </div>
  );
}
