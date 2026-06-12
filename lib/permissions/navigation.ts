import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Package,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Tags,
} from "lucide-react";
import {
  AUDIT_LOGS_ALLOWED_ROLES,
  CATEGORIES_ALLOWED_ROLES,
  DASHBOARD_ALLOWED_ROLES,
  INVENTORY_ALLOWED_ROLES,
  PRODUCTS_ALLOWED_ROLES,
  REPORTS_ALLOWED_ROLES,
  SALES_ALLOWED_ROLES,
  SALES_CHANNELS_ALLOWED_ROLES,
  USERS_ALLOWED_ROLES,
} from "@/lib/permissions/roles";
import type { NavigationItem } from "@/types/navigation";
import type { UserRole } from "@/types/roles";

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: DASHBOARD_ALLOWED_ROLES,
    module: "dashboard",
    description: "Resumen inicial de la operacion administrativa.",
    sprint: "Sprint 3",
  },
  {
    label: "Categorias",
    href: "/categories",
    icon: Tags,
    roles: CATEGORIES_ALLOWED_ROLES,
    module: "categories",
    description: "Placeholder del modulo de categorias.",
    sprint: "Sprint 4 o posterior",
  },
  {
    label: "Canales",
    href: "/sales-channels",
    icon: ShoppingCart,
    roles: SALES_CHANNELS_ALLOWED_ROLES,
    module: "sales-channels",
    description: "Placeholder del modulo de canales de venta.",
    sprint: "Sprint 4 o posterior",
  },
  {
    label: "Productos",
    href: "/products",
    icon: Package,
    roles: PRODUCTS_ALLOWED_ROLES,
    module: "products",
    description: "Placeholder del modulo de productos.",
    sprint: "Sprint 4 o posterior",
  },
  {
    label: "Inventario",
    href: "/inventory",
    icon: Boxes,
    roles: INVENTORY_ALLOWED_ROLES,
    module: "inventory",
    description: "Placeholder del modulo de inventario.",
    sprint: "Sprint 4 o posterior",
  },
  {
    label: "Ventas",
    href: "/sales",
    icon: ReceiptText,
    roles: SALES_ALLOWED_ROLES,
    module: "sales",
    description: "Placeholder del modulo de ventas.",
    sprint: "Sprint 4 o posterior",
  },
  {
    label: "Reportes",
    href: "/reports",
    icon: BarChart3,
    roles: REPORTS_ALLOWED_ROLES,
    module: "reports",
    description: "Placeholder del modulo de reportes.",
    sprint: "Sprint 5 o posterior",
  },
  {
    label: "Auditoria",
    href: "/audit-logs",
    icon: ShieldCheck,
    roles: AUDIT_LOGS_ALLOWED_ROLES,
    module: "audit-logs",
    description: "Placeholder del modulo de auditoria.",
    sprint: "Sprint 5 o posterior",
  },
  {
    label: "Usuarios",
    href: "/users",
    icon: ClipboardList,
    roles: USERS_ALLOWED_ROLES,
    module: "users",
    description: "Placeholder del modulo de usuarios.",
    sprint: "Sprint 5 o posterior",
  },
];

export function getNavigationForRole(role: UserRole) {
  return navigationItems.filter((item) => item.roles.includes(role));
}

export function getNavigationItemForPath(pathname: string) {
  return navigationItems.find((item) => {
    if (pathname === item.href) {
      return true;
    }

    return pathname.startsWith(`${item.href}/`);
  });
}
