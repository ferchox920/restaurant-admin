import { z } from "zod";
import { isQuantityInputValid, normalizeQuantityInput } from "@/lib/quantity";

function quantityStringSchema(
  label: string,
  options?: { allowZero?: boolean }
) {
  const allowZero = options?.allowZero ?? false;

  return z
    .string()
    .trim()
    .min(1, `${label} es obligatorio.`)
    .refine((value) => isQuantityInputValid(value), {
      message: `${label} debe ser un decimal valido sin separadores de miles.`,
    })
    .refine(
      (value) =>
        Number(normalizeQuantityInput(value)) >= (allowZero ? 0 : 0.01),
      {
        message: allowZero
          ? `${label} debe ser mayor o igual a 0.`
          : `${label} debe ser mayor que 0.`,
      }
    );
}

const reasonSchema = z.string().trim().min(1, "El motivo es obligatorio.");

export const stockInOperationSchema = z.object({
  quantity: quantityStringSchema("La cantidad"),
  reason: reasonSchema,
});

export const manualAdjustmentOperationSchema = z.object({
  newStock: quantityStringSchema("El nuevo stock", { allowZero: true }),
  reason: reasonSchema,
});

export const wasteOperationSchema = z.object({
  quantity: quantityStringSchema("La cantidad"),
  reason: reasonSchema,
});

export const returnInOperationSchema = z.object({
  quantity: quantityStringSchema("La cantidad"),
  reason: reasonSchema,
});

export const updateMinimumStockOperationSchema = z.object({
  minimumStock: quantityStringSchema("El stock minimo", { allowZero: true }),
});
