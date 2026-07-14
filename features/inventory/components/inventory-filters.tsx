"use client";

import { RotateCcw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InventoryStockStatus } from "@/features/inventory/types/inventory.types";

type InventoryFilterValue = "all" | "active" | "inactive";

type InventoryFiltersProps = {
  activeFilter: InventoryFilterValue;
  onActiveFilterChange: (value: InventoryFilterValue) => void;
  stockStatus?: InventoryStockStatus;
  onStockStatusChange: (value?: InventoryStockStatus) => void;
  search: string;
  onSearchChange: (value: string) => void;
};

const stockStatusLabels: Record<InventoryStockStatus, string> = {
  AVAILABLE: "Disponible",
  LOW_STOCK: "Stock bajo",
  OUT_OF_STOCK: "Sin stock",
};

export function InventoryFilters({
  activeFilter,
  onActiveFilterChange,
  stockStatus,
  onStockStatusChange,
  search,
  onSearchChange,
}: InventoryFiltersProps) {
  const hasFilters =
    activeFilter !== "all" || Boolean(stockStatus || search.trim());

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="space-y-2">
        <Label htmlFor="inventory-search">Buscar producto</Label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="inventory-search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pr-9 pl-9"
          />
          {search ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1/2 right-2 -translate-y-1/2"
              aria-label="Limpiar búsqueda"
              onClick={() => onSearchChange("")}
            >
              <X aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Estado de stock</Label>
        <Select
          value={stockStatus ?? "__all__"}
          onValueChange={(value) =>
            onStockStatusChange(
              value === "__all__" ? undefined : (value as InventoryStockStatus)
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos los estados">
              {(value) =>
                !value || value === "__all__"
                  ? "Todos los estados"
                  : stockStatusLabels[value as InventoryStockStatus]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos los estados</SelectItem>
            <SelectItem value="AVAILABLE">{stockStatusLabels.AVAILABLE}</SelectItem>
            <SelectItem value="LOW_STOCK">{stockStatusLabels.LOW_STOCK}</SelectItem>
            <SelectItem value="OUT_OF_STOCK">
              {stockStatusLabels.OUT_OF_STOCK}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 lg:col-span-2">
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filtrar productos por estado"
        >
          <Button
            type="button"
            size="sm"
            variant={activeFilter === "all" ? "default" : "outline"}
            aria-pressed={activeFilter === "all"}
            onClick={() => onActiveFilterChange("all")}
          >
            Todos
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activeFilter === "active" ? "default" : "outline"}
            aria-pressed={activeFilter === "active"}
            onClick={() => onActiveFilterChange("active")}
          >
            Activos
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activeFilter === "inactive" ? "default" : "outline"}
            aria-pressed={activeFilter === "inactive"}
            onClick={() => onActiveFilterChange("inactive")}
          >
            Inactivos
          </Button>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={!hasFilters}
          onClick={() => {
            onActiveFilterChange("all");
            onStockStatusChange(undefined);
            onSearchChange("");
          }}
        >
          <RotateCcw aria-hidden="true" />
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}
