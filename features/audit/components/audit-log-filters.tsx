"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserSelector } from "@/features/users/components/user-selector";
import { auditActions, auditEntityTypes, type AuditAction, type AuditEntityType } from "@/features/audit/types/audit-log.types";

export type AuditLogFilterValues = {
  from: string;
  to: string;
  action: AuditAction | "__all__";
  entityType: AuditEntityType | "__all__";
  entityId: string;
  userId: string;
  limit: string;
  allowActorSelector: boolean;
};

type AuditLogFiltersProps = {
  values: AuditLogFilterValues;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onActionChange: (value: AuditAction | "__all__") => void;
  onEntityTypeChange: (value: AuditEntityType | "__all__") => void;
  onEntityIdChange: (value: string) => void;
  onUserIdChange: (value: string) => void;
  onLimitChange: (value: string) => void;
  onReset: () => void;
};

const auditActionLabels: Record<AuditAction, string> = {
  USER_CREATED: "Usuario creado",
  USER_UPDATED: "Usuario actualizado",
  USER_DEACTIVATED: "Usuario desactivado",
  USER_REACTIVATED: "Usuario reactivado",
  CATEGORY_CREATED: "Categoria creada",
  CATEGORY_UPDATED: "Categoria actualizada",
  CATEGORY_DEACTIVATED: "Categoria desactivada",
  CATEGORY_REACTIVATED: "Categoria reactivada",
  SALES_CHANNEL_CREATED: "Canal creado",
  SALES_CHANNEL_UPDATED: "Canal actualizado",
  SALES_CHANNEL_DEACTIVATED: "Canal desactivado",
  SALES_CHANNEL_REACTIVATED: "Canal reactivado",
  PRODUCT_CREATED: "Producto creado",
  PRODUCT_UPDATED: "Producto actualizado",
  PRODUCT_DEACTIVATED: "Producto desactivado",
  PRODUCT_REACTIVATED: "Producto reactivado",
  PRODUCT_COST_CREATED: "Costo creado",
  PRODUCT_PRICE_CREATED: "Precio creado",
  INVENTORY_STOCK_IN: "Ingreso de stock",
  INVENTORY_MANUAL_ADJUSTMENT: "Ajuste manual",
  INVENTORY_WASTE: "Merma",
  INVENTORY_RETURN_IN: "Reingreso",
  INVENTORY_SALE_OUT: "Salida por venta",
  INVENTORY_VOID_REVERSAL: "Reversion de venta",
  INVENTORY_MINIMUM_STOCK_UPDATED: "Stock minimo actualizado",
  SALE_TICKET_CREATED: "Venta creada",
  SALE_TICKET_UPDATED: "Venta actualizada",
  SALE_TICKET_CANCELLED: "Venta cancelada",
  SALE_TICKET_ITEM_ADDED: "Item agregado",
  SALE_TICKET_ITEM_UPDATED: "Item actualizado",
  SALE_TICKET_ITEM_REMOVED: "Item removido",
  SALE_TICKET_CONFIRMED: "Venta confirmada",
  SALE_TICKET_VOIDED: "Venta anulada",
};

const auditEntityTypeLabels: Record<AuditEntityType, string> = {
  USER: "Usuario",
  CATEGORY: "Categoria",
  SALES_CHANNEL: "Canal de venta",
  PRODUCT: "Producto",
  PRODUCT_COST_HISTORY: "Historial de costos",
  PRODUCT_PRICE_HISTORY: "Historial de precios",
  PRODUCT_STOCK: "Stock de producto",
  INVENTORY_MOVEMENT: "Movimiento de inventario",
  SALE_TICKET: "Venta",
  SALE_TICKET_ITEM: "Item de venta",
  SYSTEM: "Sistema",
};

export function AuditLogFilters({
  values,
  onFromChange,
  onToChange,
  onActionChange,
  onEntityTypeChange,
  onEntityIdChange,
  onUserIdChange,
  onLimitChange,
  onReset,
}: AuditLogFiltersProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="audit-from">Desde</Label>
          <Input id="audit-from" type="date" value={values.from} onChange={(event) => onFromChange(event.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="audit-to">Hasta</Label>
          <Input id="audit-to" type="date" value={values.to} onChange={(event) => onToChange(event.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Accion</Label>
          <Select value={values.action} onValueChange={(value) => onActionChange((value ?? "__all__") as AuditAction | "__all__")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas">
                {(value) =>
                  !value || value === "__all__"
                    ? "Todas"
                    : auditActionLabels[value as AuditAction]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              {auditActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {auditActionLabels[action]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tipo de entidad</Label>
          <Select value={values.entityType} onValueChange={(value) => onEntityTypeChange((value ?? "__all__") as AuditEntityType | "__all__")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas">
                {(value) =>
                  !value || value === "__all__"
                    ? "Todas"
                    : auditEntityTypeLabels[value as AuditEntityType]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              {auditEntityTypes.map((entityType) => (
                <SelectItem key={entityType} value={entityType}>
                  {auditEntityTypeLabels[entityType]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="audit-entity-id">Entity ID</Label>
          <Input id="audit-entity-id" value={values.entityId} onChange={(event) => onEntityIdChange(event.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>{values.allowActorSelector ? "Actor" : "Actor (UUID)"}</Label>
          {values.allowActorSelector ? (
            <>
              <UserSelector
                value={values.userId || "__all__"}
                onValueChange={(value) => onUserIdChange(value === "__all__" ? "" : value)}
                includeInactive
                includeAllOption
              />
              <p className="text-xs text-muted-foreground">
                Visible solo para ADMIN porque `GET /api/users` no esta autorizado para otros roles.
              </p>
            </>
          ) : (
            <>
              <Input
                value={values.userId}
                onChange={(event) => onUserIdChange(event.target.value)}
                placeholder="UUID del actor"
              />
              <p className="text-xs text-muted-foreground">
                Filtro avanzado por UUID para no disparar requests no autorizados a Users.
              </p>
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="audit-limit">Limite</Label>
          <Input
            id="audit-limit"
            value={values.limit}
            onChange={(event) => onLimitChange(event.target.value)}
            inputMode="numeric"
            placeholder="50"
          />
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
