"use client";

import { RotateCcw } from "lucide-react";
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
import type { SalesChannel } from "@/features/sales-channels/types/sales-channel.types";
import type { Product } from "@/features/products/types/product.types";

export type SalesReportFilterValues = {
  from: string;
  to: string;
  salesChannelId: string;
  productId?: string;
};

type SalesReportFiltersProps = {
  channels: SalesChannel[];
  products?: Product[];
  values: SalesReportFilterValues;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onSalesChannelIdChange: (value: string) => void;
  onProductIdChange?: (value: string) => void;
  onReset: () => void;
};

export function SalesReportFilters({
  channels,
  products,
  values,
  onFromChange,
  onToChange,
  onSalesChannelIdChange,
  onProductIdChange,
  onReset,
}: SalesReportFiltersProps) {
  const hasProductFilter =
    Array.isArray(products) && typeof onProductIdChange === "function";

  return (
    <>
      <div
        className={`grid gap-4 md:grid-cols-2 ${hasProductFilter ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}
      >
        <div className="space-y-2">
          <Label htmlFor="sales-report-from">Desde</Label>
          <Input
            id="sales-report-from"
            type="date"
            value={values.from}
            max={values.to || undefined}
            onChange={(event) => {
              const value = event.target.value;
              onFromChange(value);
              if (values.to && value > values.to) onToChange("");
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sales-report-to">Hasta</Label>
          <Input
            id="sales-report-to"
            type="date"
            value={values.to}
            min={values.from || undefined}
            onChange={(event) => onToChange(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Canal</Label>
          <Select
            value={values.salesChannelId}
            onValueChange={(value) =>
              onSalesChannelIdChange(value ?? "__all__")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los canales">
                {(value) => {
                  if (!value || value === "__all__") {
                    return "Todos los canales";
                  }

                  return (
                    channels.find((channel) => channel.id === value)?.name ??
                    "Todos los canales"
                  );
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos los canales</SelectItem>
              {channels.map((channel) => (
                <SelectItem key={channel.id} value={channel.id}>
                  {channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasProductFilter ? (
          <div className="space-y-2">
            <Label>Producto</Label>
            <Select
              value={values.productId ?? "__all__"}
              onValueChange={(value) => onProductIdChange(value ?? "__all__")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos los productos">
                  {(value) => {
                    if (!value || value === "__all__") {
                      return "Todos los productos";
                    }

                    return (
                      products.find((product) => product.id === value)?.name ??
                      "Todos los productos"
                    );
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los productos</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
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
