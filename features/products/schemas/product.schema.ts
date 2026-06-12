import { z } from "zod";
import {
  productUnits,
  stockManagementTypes,
} from "@/features/products/types/product.types";

export const productSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "")
    .transform((value) => (value.length > 0 ? value : undefined)),
  sku: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "")
    .transform((value) => (value.length > 0 ? value : undefined)),
  categoryId: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "")
    .transform((value) => (value.length > 0 ? value : undefined)),
  unit: z.enum(productUnits, {
    message: "Selecciona una unidad valida.",
  }),
  stockManagementType: z.enum(stockManagementTypes, {
    message: "Selecciona un tipo de gestion valido.",
  }),
});
