import { z } from "zod";
import { normalizeDecimalInput } from "@/lib/money";

function isValidDecimalString(value: string) {
  return /^\d+(\.\d+)?$/.test(value);
}

export const productCostSchema = z.object({
  cost: z
    .string()
    .trim()
    .min(1, "El costo es obligatorio.")
    .transform((value) => normalizeDecimalInput(value))
    .refine((value) => value.length > 0 && isValidDecimalString(value), {
      message: "Ingresa un decimal valido.",
    })
    .refine((value) => Number(value) >= 0, {
      message: "El costo debe ser mayor o igual a 0.",
    }),
});
