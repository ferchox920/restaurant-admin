"use client";

import { RotateCcw, Search } from "lucide-react";
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
import { userRoles, type UserFilters } from "@/features/users/types/user.types";
import { formatUserRole } from "@/lib/formatters";

type UserFiltersProps = {
  values: Required<Pick<UserFilters, "search">> & {
    active: "all" | "active" | "inactive";
    role: "all" | (typeof userRoles)[number];
  };
  onChange: (
    nextValues: Required<Pick<UserFilters, "search">> & {
      active: "all" | "active" | "inactive";
      role: "all" | (typeof userRoles)[number];
    }
  ) => void;
  onReset: () => void;
};

export function UserFilters({ values, onChange, onReset }: UserFiltersProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="users-search">Busqueda local</Label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="users-search"
            value={values.search}
            onChange={(event) =>
              onChange({
                ...values,
                search: event.target.value,
              })
            }
            placeholder="Nombre o email"
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Estado</Label>
        <Select
          value={values.active}
          onValueChange={(value) =>
            onChange({
              ...values,
              active: value as "all" | "active" | "inactive",
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos los estados">
              {(value) =>
                value === "active"
                  ? "Activos"
                  : value === "inactive"
                    ? "Inactivos"
                    : "Todos los estados"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Rol</Label>
        <Select
          value={values.role}
          onValueChange={(value) =>
            onChange({
              ...values,
              role: value as "all" | (typeof userRoles)[number],
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos los roles">
              {(value) =>
                !value || value === "all"
                  ? "Todos los roles"
                  : formatUserRole(value as (typeof userRoles)[number])
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            {userRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {formatUserRole(role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:col-span-3">
        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcw aria-hidden="true" />
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}
