import type {
  ProductUnit,
  StockManagementType,
} from "@/features/products/types/product.types";
import type { Category } from "@/features/categories/types/category.types";
import type { CommissionType } from "@/features/sales-channels/types/sales-channel.types";
import type { SalesChannel } from "@/features/sales-channels/types/sales-channel.types";
import type { UserRole } from "@/features/users/types/user.types";

const stockManagementLabels: Record<StockManagementType, string> = {
  FINISHED_PRODUCT: "Inventariable",
  RECIPE_BASED: "Reservado / no operativo",
  NON_STOCKED: "No inventariable",
};

const productUnitLabels: Record<ProductUnit, string> = {
  UNIT: "Unidad",
  PORTION: "Porcion",
  SERVICE: "Servicio",
};

const commissionTypeLabels: Record<CommissionType, string> = {
  NONE: "Sin comision",
  PERCENTAGE: "Porcentaje",
  FIXED: "Monto fijo",
};

const userRoleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  MANAGER: "Encargado",
  CASHIER: "Cajero",
  AUDITOR: "Auditor",
};

export function formatDateTime(
  value: string | null | undefined,
  locale = "es-AR"
) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatProductUnit(value: ProductUnit) {
  return productUnitLabels[value];
}

export function formatStockManagementType(value: StockManagementType) {
  return stockManagementLabels[value];
}

export function formatCommissionType(value: CommissionType) {
  return commissionTypeLabels[value];
}

export function formatUserRole(value: UserRole) {
  return userRoleLabels[value];
}

export function formatCategoryName(category?: Pick<Category, "name"> | null) {
  return category?.name ?? "Sin categoria";
}

export function formatSalesChannelName(
  salesChannel?: Pick<SalesChannel, "name"> | null
) {
  return salesChannel?.name ?? "Sin canal";
}
