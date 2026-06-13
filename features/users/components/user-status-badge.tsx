import { StatusBadge } from "@/components/common/status-badge";

export function UserStatusBadge({ active }: { active: boolean }) {
  return <StatusBadge status={active ? "active" : "inactive"} />;
}
