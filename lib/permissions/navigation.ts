import {
  BarChart3,
  Boxes,
  ClipboardList,
  Grid3X3,
  Landmark,
  LayoutDashboard,
  Package,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Table2,
  Tags,
} from "lucide-react";
import {
  AUDIT_LOGS_ALLOWED_ROLES,
  CATEGORIES_ALLOWED_ROLES,
  DASHBOARD_ALLOWED_ROLES,
  FLOOR_ALLOWED_ROLES,
  INVENTORY_ALLOWED_ROLES,
  PAYMENT_BANKS_ALLOWED_ROLES,
  PRODUCTS_ALLOWED_ROLES,
  REPORTS_ALLOWED_ROLES,
  SALES_ALLOWED_ROLES,
  SALES_CHANNELS_ALLOWED_ROLES,
  TABLES_ALLOWED_ROLES,
  TABLE_ORDERS_ALLOWED_ROLES,
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
    description: "Gestion de categorias del catalogo administrativo.",
    sprint: "Sprint 4",
  },
  {
    label: "Canales",
    href: "/sales-channels",
    icon: ShoppingCart,
    roles: SALES_CHANNELS_ALLOWED_ROLES,
    module: "sales-channels",
    description: "Gestion de canales de venta y sus datos operativos.",
    sprint: "Sprint 4",
  },
  {
    label: "Bancos",
    href: "/payment-banks",
    icon: Landmark,
    roles: PAYMENT_BANKS_ALLOWED_ROLES,
    module: "payment-banks",
    description: "Bancos disponibles para registrar pagos por transferencia.",
    sprint: "Sprint 7",
  },
  {
    label: "Productos",
    href: "/products",
    icon: Package,
    roles: PRODUCTS_ALLOWED_ROLES,
    module: "products",
    description: "Gestion de productos y acceso a costos, precios e inventario.",
    sprint: "Sprint 4",
  },
  {
    label: "Inventario",
    href: "/inventory",
    icon: Boxes,
    roles: INVENTORY_ALLOWED_ROLES,
    module: "inventory",
    description: "Stock general, detalle por producto y movimientos operativos.",
    sprint: "Sprint 6",
  },
  {
    label: "Ventas",
    href: "/sales",
    icon: ReceiptText,
    roles: SALES_ALLOWED_ROLES,
    module: "sales",
    description: "Tickets de venta, confirmacion y anulacion segun permisos.",
    sprint: "Sprint 7",
  },
  {
    label: "Salon",
    href: "/floor",
    icon: Grid3X3,
    roles: FLOOR_ALLOWED_ROLES,
    module: "floor",
    description: "Vista operativa de mesas y ordenes abiertas.",
    sprint: "Sprint 11",
  },
  {
    label: "Mesas",
    href: "/tables",
    icon: Table2,
    roles: TABLES_ALLOWED_ROLES,
    module: "tables",
    description: "Administracion de mesas del local.",
    sprint: "Sprint 11",
  },
  {
    label: "Ordenes de mesa",
    href: "/table-orders",
    icon: ClipboardList,
    roles: TABLE_ORDERS_ALLOWED_ROLES,
    module: "table-orders",
    description: "Listado e historial de ordenes de consumo por mesa.",
    sprint: "Sprint 11",
  },
  {
    label: "Reportes",
    href: "/reports",
    icon: BarChart3,
    roles: REPORTS_ALLOWED_ROLES,
    module: "reports",
    description: "Reportes operativos con filtros reales del backend.",
    sprint: "Sprint 8",
  },
  {
    label: "Auditoria",
    href: "/audit-logs",
    icon: ShieldCheck,
    roles: AUDIT_LOGS_ALLOWED_ROLES,
    module: "audit-logs",
    description: "Consulta de registros de auditoria en solo lectura.",
    sprint: "Sprint 9",
  },
  {
    label: "Usuarios",
    href: "/users",
    icon: ClipboardList,
    roles: USERS_ALLOWED_ROLES,
    module: "users",
    description: "Gestion administrativa de usuarios internos.",
    sprint: "Sprint 9",
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
