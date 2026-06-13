import { getNavigationItemForPath } from "@/lib/permissions/navigation";
import type { UserRole } from "@/types/roles";

const routeRoleOverrides: Array<{
  pathname: string;
  roles: UserRole[];
}> = [
  {
    pathname: "/sales/new",
    roles: ["ADMIN", "MANAGER", "CASHIER"],
  },
];

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

  const routeOverride = routeRoleOverrides.find(
    (item) => item.pathname === normalizedPathname
  );

  if (routeOverride) {
    return routeOverride.roles.includes(role);
  }

  const matchingItem = getNavigationItemForPath(normalizedPathname);

  if (!matchingItem) {
    return false;
  }

  return matchingItem.roles.includes(role);
}
