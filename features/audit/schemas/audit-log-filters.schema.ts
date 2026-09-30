import { z } from "zod";
import {
  auditActions,
  auditEntityTypes,
} from "@/features/audit/types/audit-log.types";

export const auditLogFiltersSchema = z
  .object({
    userId: z.string().uuid("El usuario debe ser un UUID valido.").optional(),
    action: z.enum(auditActions).optional(),
    entityType: z.enum(auditEntityTypes).optional(),
    entityId: z.string().trim().min(1).optional(),
    from: z
      .string()
      .datetime("La fecha desde debe ser ISO datetime.")
      .optional(),
    to: z.string().datetime("La fecha hasta debe ser ISO datetime.").optional(),
    limit: z
      .number()
      .int("El limite debe ser un numero entero.")
      .min(1, "El limite minimo es 1.")
      .max(100, "El limite maximo es 100.")
      .optional(),
    offset: z
      .number()
      .int("El offset debe ser un numero entero.")
      .min(0, "El offset no puede ser negativo.")
      .optional(),
  })
  .refine(
    (value) =>
      !value.from ||
      !value.to ||
      new Date(value.from).getTime() <= new Date(value.to).getTime(),
    {
      message: "La fecha desde no puede ser posterior a la fecha hasta.",
      path: ["to"],
    }
  );
