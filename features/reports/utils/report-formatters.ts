import type { StockManagementType } from "@/features/products/types/product.types";
import type {
  InventoryMovementReportFilters,
  ReportStockStatus,
  SalesReportFilters,
  StockReportFilters,
} from "@/features/reports/types/report.types";
import { buildQueryString } from "@/lib/api/build-query-string";

type ReportEmptyStateKey =
  | "stock"
  | "sales-by-channel"
  | "sales-by-product"
  | "sales-by-user"
  | "inventory-movements";

export function getDefaultSalesDateRange(now = new Date()) {
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const from = new Date(to);
  from.setDate(from.getDate() - 29);
  const format = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  return { from: format(from), to: format(to) };
}

function toLocalDayBoundaryIso(
  value: string | undefined,
  boundary: "start" | "end"
) {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  const date =
    boundary === "start"
      ? new Date(year, month - 1, day, 0, 0, 0, 0)
      : new Date(year, month - 1, day, 23, 59, 59, 999);

  return date.toISOString();
}

export function toReportDateRange(filters: {
  from?: string;
  to?: string;
}): Pick<SalesReportFilters, "from" | "to"> {
  return {
    from: toLocalDayBoundaryIso(filters.from, "start"),
    to: toLocalDayBoundaryIso(filters.to, "end"),
  };
}

export function buildReportSearchParams(
  filters?:
    | StockReportFilters
    | SalesReportFilters
    | InventoryMovementReportFilters
) {
  return buildQueryString(
    Object.fromEntries(
      Object.entries(filters ?? {}).map(([key, value]) => [
        key,
        value ?? undefined,
      ])
    )
  );
}

export function getStockReportStatus(status: ReportStockStatus): {
  label: string;
  tone: "active" | "reserved" | "inactive" | "not-tracked";
} {
  switch (status) {
    case "AVAILABLE":
      return {
        label: "Disponible",
        tone: "active",
      };
    case "LOW_STOCK":
      return {
        label: "Stock bajo",
        tone: "reserved",
      };
    case "OUT_OF_STOCK":
      return {
        label: "Sin stock",
        tone: "inactive",
      };
    case "NOT_TRACKED":
      return {
        label: "No controlado",
        tone: "not-tracked",
      };
  }
}

export function formatReportDateRange(filters: { from?: string; to?: string }) {
  if (!filters.from && !filters.to) {
    return "Sin rango aplicado";
  }

  if (filters.from && filters.to) {
    return `${filters.from} - ${filters.to}`;
  }

  if (filters.from) {
    return `Desde ${filters.from}`;
  }

  return `Hasta ${filters.to}`;
}

export function getReportEmptyMessage(report: ReportEmptyStateKey) {
  switch (report) {
    case "stock":
      return "No hay productos para los filtros seleccionados.";
    case "sales-by-channel":
      return "No hay ventas confirmadas agrupadas por canal para el rango aplicado.";
    case "sales-by-product":
      return "No hay ventas confirmadas por producto para los filtros seleccionados.";
    case "sales-by-user":
      return "No hay ventas confirmadas por usuario para los filtros seleccionados.";
    case "inventory-movements":
      return "No hay movimientos de inventario para los filtros aplicados.";
  }
}

export function formatReportStockManagementType(value: StockManagementType) {
  switch (value) {
    case "FINISHED_PRODUCT":
      return "Inventariable";
    case "RECIPE_BASED":
      return "Reservado / receta";
    case "NON_STOCKED":
      return "No inventariable";
  }
}

export function formatNullableUserName(
  fullName: string | null,
  email: string | null
) {
  if (fullName) {
    return fullName;
  }

  if (email) {
    return email;
  }

  return "Usuario desconocido";
}
