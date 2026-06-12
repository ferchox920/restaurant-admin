import { getNavigationItemForPath } from "@/lib/permissions/navigation";
import type { UserRole } from "@/types/roles";

function normalizePathname(pathname: string) {
  if (!pathname) {
    return "/";
  }

  return pathname.replace(/\/+$/, "") || "/";
}

export function canAccessRoute(role: UserRole, pathname: string) {
  const normalizedPathname = normalizePathname(pathname);

  if (
    normalizedPathname === "/forbidden" ||
    normalizedPathname === "/login" ||
    normalizedPathname === "/"
  ) {
    return true;
  }

  const matchingItem = getNavigationItemForPath(normalizedPathname);

  if (!matchingItem) {
    return false;
  }

  return matchingItem.roles.includes(role);
}
