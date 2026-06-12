import type { Category } from "@/features/categories/types/category.types";

export const productUnits = ["UNIT", "PORTION", "SERVICE"] as const;
export const stockManagementTypes = [
  "FINISHED_PRODUCT",
  "RECIPE_BASED",
  "NON_STOCKED",
] as const;

export type ProductUnit = (typeof productUnits)[number];
export type StockManagementType = (typeof stockManagementTypes)[number];

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  sku?: string | null;
  categoryId?: string | null;
  category?: Category | null;
  unit: ProductUnit;
  stockManagementType: StockManagementType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = {
  name: string;
  description?: string;
  sku?: string;
  categoryId?: string;
  unit: ProductUnit;
  stockManagementType: StockManagementType;
};

export type UpdateProductInput = {
  name?: string;
  description?: string;
  sku?: string;
  categoryId?: string;
  unit?: ProductUnit;
  stockManagementType?: StockManagementType;
};

export type CatalogVisualStatus =
  | "active"
  | "inactive"
  | "reserved"
  | "not-tracked"
  | "future";

export type ProductCatalogHint = {
  status: CatalogVisualStatus;
  label: string;
};

export function getProductCatalogHint(
  stockManagementType: StockManagementType,
  active: boolean
): ProductCatalogHint {
  if (!active) {
    return {
      status: "inactive",
      label: "Inactivo",
    };
  }

  if (stockManagementType === "RECIPE_BASED") {
    return {
      status: "reserved",
      label: "Reservado / no operativo",
    };
  }

  if (stockManagementType === "NON_STOCKED") {
    return {
      status: "not-tracked",
      label: "No inventariable",
    };
  }

  return {
    status: "future",
    label: "Inventariable futuro",
  };
}
