"use client";

import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reportStockStatuses, type ReportStockStatus } from "@/features/reports/types/report.types";
import type { StockManagementType } from "@/features/products/types/product.types";
import type { Category } from "@/features/categories/types/category.types";
import { formatStockManagementType } from "@/lib/formatters";

type StockReportFilterValues = {
  activeFilter: "__all__" | "active" | "inactive";
  categoryId: string;
  stockStatus: ReportStockStatus | "__all__";
  stockManagementType: StockManagementType | "__all__";
  search: string;
};

type StockReportFiltersProps = {
  categories: Category[];
  values: StockReportFilterValues;
  onActiveFilterChange: (value: StockReportFilterValues["activeFilter"]) => void;
  onCategoryIdChange: (value: string) => void;
  onStockStatusChange: (value: StockReportFilterValues["stockStatus"]) => void;
  onStockManagementTypeChange: (
    value: StockReportFilterValues["stockManagementType"]
  ) => void;
  onSearchChange: (value: string) => void;
  onReset: () => void;
};

const stockStatusLabels: Record<ReportStockStatus, string> = {
  AVAILABLE: "Disponible",
  LOW_STOCK: "Stock bajo",
  OUT_OF_STOCK: "Sin stock",
  NOT_TRACKED: "No controlado",
};

export function StockReportFilters({
  categories,
  values,
  onActiveFilterChange,
  onCategoryIdChange,
  onStockStatusChange,
  onStockManagementTypeChange,
  onSearchChange,
  onReset,
}: StockReportFiltersProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="space-y-2">
          <Label>Estado del producto</Label>
          <Select
            value={values.activeFilter}
            onValueChange={(value) =>
              onActiveFilterChange(
                (value ?? "__all__") as StockReportFilterValues["activeFilter"]
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos">
                {(value) =>
                  value === "active"
                    ? "Activos"
                    : value === "inactive"
                      ? "Inactivos"
                      : "Todos"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select
            value={values.categoryId}
            onValueChange={(value) => onCategoryIdChange(value ?? "__all__")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas">
                {(value) => {
                  if (!value || value === "__all__") {
                    return "Todas";
                  }

                  return (
                    categories.find((category) => category.id === value)?.name ??
                    "Todas"
                  );
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Estado de stock</Label>
          <Select
            value={values.stockStatus}
            onValueChange={(value) =>
              onStockStatusChange(
                (value ?? "__all__") as StockReportFilterValues["stockStatus"]
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos">
                {(value) =>
                  !value || value === "__all__"
                    ? "Todos"
                    : stockStatusLabels[value as ReportStockStatus]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              {reportStockStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {stockStatusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tipo de gestion</Label>
          <Select
            value={values.stockManagementType}
            onValueChange={(value) =>
              onStockManagementTypeChange(
                (value ?? "__all__") as StockReportFilterValues["stockManagementType"]
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos">
                {(value) =>
                  !value || value === "__all__"
                    ? "Todos"
                    : formatStockManagementType(value as StockManagementType)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              <SelectItem value="FINISHED_PRODUCT">
                {formatStockManagementType("FINISHED_PRODUCT")}
              </SelectItem>
              <SelectItem value="RECIPE_BASED">
                {formatStockManagementType("RECIPE_BASED")}
              </SelectItem>
              <SelectItem value="NON_STOCKED">
                {formatStockManagementType("NON_STOCKED")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock-report-search">Busqueda</Label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="stock-report-search"
              value={values.search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Producto o SKU"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcw aria-hidden="true" />
          Limpiar filtros
        </Button>
      </div>
    </>
  );
}
