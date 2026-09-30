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
import type { Category } from "@/features/categories/types/category.types";

type ProductFilterValue = "all" | "active" | "inactive";

type ProductFiltersProps = {
  filter: ProductFilterValue;
  onFilterChange: (value: ProductFilterValue) => void;
  search: string;
  onSearchChange: (value: string) => void;
  categoryId?: string;
  onCategoryChange: (value?: string) => void;
  categories: Category[];
  counts: {
    total: number;
    active: number;
    inactive: number;
  };
};

export function ProductFilters({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  categories,
  counts,
}: ProductFiltersProps) {
  const hasFilters = filter !== "all" || Boolean(search || categoryId);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="space-y-2">
        <Label htmlFor="products-search">Buscar producto</Label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="products-search"
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
        <Label>Categoría</Label>
        <Select
          value={categoryId ?? "__all__"}
          onValueChange={(value) =>
            onCategoryChange(!value || value === "__all__" ? undefined : value)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todas las categorías">
              {(value) => {
                if (!value || value === "__all__") {
                  return "Todas las categorías";
                }

                const category = categories.find((item) => item.id === value);

                return category
                  ? `${category.name}${!category.active ? " (inactiva)" : ""}`
                  : "Todas las categorías";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
                {!category.active ? " (inactiva)" : ""}
              </SelectItem>
            ))}
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
            variant={filter === "all" ? "default" : "outline"}
            aria-pressed={filter === "all"}
            onClick={() => onFilterChange("all")}
          >
            Todos ({counts.total})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filter === "active" ? "default" : "outline"}
            aria-pressed={filter === "active"}
            onClick={() => onFilterChange("active")}
          >
            Activos ({counts.active})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filter === "inactive" ? "default" : "outline"}
            aria-pressed={filter === "inactive"}
            onClick={() => onFilterChange("inactive")}
          >
            Inactivos ({counts.inactive})
          </Button>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={!hasFilters}
          onClick={() => {
            onFilterChange("all");
            onSearchChange("");
            onCategoryChange(undefined);
          }}
        >
          <RotateCcw aria-hidden="true" />
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}
