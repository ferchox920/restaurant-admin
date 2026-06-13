import { z } from "zod";
import { inventoryMovementTypes, inventoryReferenceTypes } from "@/features/inventory/types/inventory.types";
import { stockManagementTypes } from "@/features/products/types/product.types";
import { reportStockStatuses } from "@/features/reports/types/report.types";

const optionalUuidSchema = z
  .string()
  .trim()
  .uuid("Debe ser un UUID valido.")
  .optional();

const optionalIsoDateSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Debe ser una fecha ISO valida.",
  })
  .optional();

function withDateRangeValidation<T extends z.ZodRawShape>(shape: T) {
  return z
    .object(shape)
    .refine(
      (value) => {
        if (!("from" in value) || !("to" in value)) {
          return true;
        }

        const from =
          typeof value.from === "string" ? new Date(value.from).getTime() : undefined;
        const to =
          typeof value.to === "string" ? new Date(value.to).getTime() : undefined;

        if (from === undefined || to === undefined) {
          return true;
        }

        return from <= to;
      },
      {
        message: '"from" cannot be greater than "to".',
        path: ["to"],
      }
    );
}

export const stockReportFiltersSchema = z.object({
  active: z.boolean().optional(),
  categoryId: optionalUuidSchema,
  stockStatus: z.enum(reportStockStatuses).optional(),
  stockManagementType: z.enum(stockManagementTypes).optional(),
  search: z.string().trim().optional(),
});

export const salesReportFiltersSchema = withDateRangeValidation({
  from: optionalIsoDateSchema,
  to: optionalIsoDateSchema,
  salesChannelId: optionalUuidSchema,
  productId: optionalUuidSchema,
  userId: optionalUuidSchema,
});

export const inventoryMovementReportFiltersSchema = withDateRangeValidation({
  productId: optionalUuidSchema,
  movementType: z.enum(inventoryMovementTypes).optional(),
  referenceType: z.enum(inventoryReferenceTypes).optional(),
  createdById: optionalUuidSchema,
  from: optionalIsoDateSchema,
  to: optionalIsoDateSchema,
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});
