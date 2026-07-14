export const auditActions = [
  "USER_CREATED",
  "USER_UPDATED",
  "USER_DEACTIVATED",
  "USER_REACTIVATED",
  "CATEGORY_CREATED",
  "CATEGORY_UPDATED",
  "CATEGORY_DEACTIVATED",
  "CATEGORY_REACTIVATED",
  "SALES_CHANNEL_CREATED",
  "SALES_CHANNEL_UPDATED",
  "SALES_CHANNEL_DEACTIVATED",
  "SALES_CHANNEL_REACTIVATED",
  "PRODUCT_CREATED",
  "PRODUCT_UPDATED",
  "PRODUCT_DEACTIVATED",
  "PRODUCT_REACTIVATED",
  "PRODUCT_COST_CREATED",
  "PRODUCT_PRICE_CREATED",
  "INVENTORY_STOCK_IN",
  "INVENTORY_MANUAL_ADJUSTMENT",
  "INVENTORY_WASTE",
  "INVENTORY_RETURN_IN",
  "INVENTORY_SALE_OUT",
  "INVENTORY_VOID_REVERSAL",
  "INVENTORY_MINIMUM_STOCK_UPDATED",
  "SALE_TICKET_CREATED",
  "SALE_TICKET_UPDATED",
  "SALE_TICKET_CANCELLED",
  "SALE_TICKET_ITEM_ADDED",
  "SALE_TICKET_ITEM_UPDATED",
  "SALE_TICKET_ITEM_REMOVED",
  "SALE_TICKET_CONFIRMED",
  "SALE_TICKET_VOIDED",
] as const;

export const auditEntityTypes = [
  "USER",
  "CATEGORY",
  "SALES_CHANNEL",
  "PRODUCT",
  "PRODUCT_COST_HISTORY",
  "PRODUCT_PRICE_HISTORY",
  "PRODUCT_STOCK",
  "INVENTORY_MOVEMENT",
  "SALE_TICKET",
  "SALE_TICKET_ITEM",
  "SYSTEM",
] as const;

export type AuditAction = (typeof auditActions)[number];
export type AuditEntityType = (typeof auditEntityTypes)[number];
export type AuditJsonValue =
  | string
  | number
  | boolean
  | null
  | AuditJsonValue[]
  | { [key: string]: AuditJsonValue };

export type AuditLog = {
  id: string;
  userId: string | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string | null;
  beforeData: AuditJsonValue | null;
  afterData: AuditJsonValue | null;
  metadata: AuditJsonValue | null;
  createdAt: string;
};

export type AuditLogListItem = AuditLog;

export type AuditLogFilters = {
  userId?: string;
  action?: AuditAction;
  entityType?: AuditEntityType;
  entityId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};
