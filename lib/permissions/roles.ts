import type { UserRole } from "@/types/roles";

export const DASHBOARD_ALLOWED_ROLES: UserRole[] = [
  "ADMIN",
  "MANAGER",
  "CASHIER",
  "AUDITOR",
];

export const CATEGORIES_ALLOWED_ROLES: UserRole[] = [
  "ADMIN",
  "MANAGER",
  "AUDITOR",
];

export const SALES_CHANNELS_ALLOWED_ROLES: UserRole[] = [
  "ADMIN",
  "MANAGER",
  "AUDITOR",
];

export const PRODUCTS_ALLOWED_ROLES: UserRole[] = [
  "ADMIN",
  "MANAGER",
  "AUDITOR",
];

export const INVENTORY_ALLOWED_ROLES: UserRole[] = [
  "ADMIN",
  "MANAGER",
  "CASHIER",
];

export const SALES_ALLOWED_ROLES: UserRole[] = [
  "ADMIN",
  "MANAGER",
  "CASHIER",
  "AUDITOR",
];

export const REPORTS_ALLOWED_ROLES: UserRole[] = ["ADMIN", "MANAGER", "AUDITOR"];

export const AUDIT_LOGS_ALLOWED_ROLES: UserRole[] = ["ADMIN", "AUDITOR"];

export const USERS_ALLOWED_ROLES: UserRole[] = ["ADMIN"];
