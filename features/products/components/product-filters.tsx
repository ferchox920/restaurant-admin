"use client";

import { Search } from "lucide-react";
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
};

export function ProductFilters({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  categories,
}: ProductFiltersProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="space-y-2">
        <Label htmlFor="products-search">Buscar producto</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="products-search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nombre o SKU"
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select
          value={categoryId ?? "__all__"}
          onValueChange={(value) =>
            onCategoryChange(
              !value || value === "__all__" ? undefined : value
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas las categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
                {!category.active ? " (inactiva)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:col-span-2">
        <Button
          type="button"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => onFilterChange("all")}
        >
          Todos
        </Button>
        <Button
          type="button"
          variant={filter === "active" ? "default" : "outline"}
          onClick={() => onFilterChange("active")}
        >
          Activos
        </Button>
        <Button
          type="button"
          variant={filter === "inactive" ? "default" : "outline"}
          onClick={() => onFilterChange("inactive")}
        >
          Inactivos
        </Button>
      </div>
    </div>
  );
}
