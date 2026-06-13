"use client";

import { Search, RotateCcw } from "lucide-react";
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
import {
  saleTicketStatuses,
  type SaleTicketStatus,
} from "@/features/sales/constants/sale-ticket-status";
import { getTicketStatusLabel } from "@/features/sales/utils/sale-ticket";
import type { SelectableSalesChannel } from "@/features/sales/components/sales-channel-selector";

export type SaleTicketFilterValues = {
  status?: SaleTicketStatus;
  channelId?: string;
  createdById: string;
  from: string;
  to: string;
};

type SaleTicketFiltersProps = {
  channels: SelectableSalesChannel[];
  values: SaleTicketFilterValues;
  onChange: (nextValues: SaleTicketFilterValues) => void;
  onReset: () => void;
};

export function SaleTicketFilters({
  channels,
  values,
  onChange,
  onReset,
}: SaleTicketFiltersProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-2">
        <Label>Estado</Label>
        <Select
          value={values.status ?? "__all__"}
          onValueChange={(value) =>
            onChange({
              ...values,
              status: value === "__all__" ? undefined : (value as SaleTicketStatus),
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos los estados">
              {(value) =>
                !value || value === "__all__"
                  ? "Todos los estados"
                  : getTicketStatusLabel(value as SaleTicketStatus)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos los estados</SelectItem>
            {saleTicketStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {getTicketStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Canal</Label>
        <Select
          value={values.channelId ?? "__all__"}
          onValueChange={(value) =>
            onChange({
              ...values,
              channelId: value === "__all__" || !value ? undefined : value,
            })
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

      <div className="space-y-2">
        <Label htmlFor="sale-ticket-created-by">Creado por</Label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="sale-ticket-created-by"
            value={values.createdById}
            onChange={(event) =>
              onChange({
                ...values,
                createdById: event.target.value,
              })
            }
            placeholder="ID del usuario creador"
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sale-ticket-from">Desde</Label>
          <Input
            id="sale-ticket-from"
            type="date"
            value={values.from}
            onChange={(event) =>
              onChange({
                ...values,
                from: event.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sale-ticket-to">Hasta</Label>
          <Input
            id="sale-ticket-to"
            type="date"
            value={values.to}
            onChange={(event) =>
              onChange({
                ...values,
                to: event.target.value,
              })
            }
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:col-span-2">
        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcw aria-hidden="true" />
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}
