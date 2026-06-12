import { z } from "zod";
import { normalizeDecimalInput } from "@/lib/money";

function isValidDecimalString(value: string) {
  return /^\d+(\.\d+)?$/.test(value);
}

export const productPriceSchema = z.object({
  salesChannelId: z.string().uuid("Selecciona un canal valido."),
  price: z
    .string()
    .trim()
    .min(1, "El precio es obligatorio.")
    .transform((value) => normalizeDecimalInput(value))
    .refine((value) => value.length > 0 && isValidDecimalString(value), {
      message: "Ingresa un decimal valido.",
    })
    .refine((value) => Number(value) >= 0, {
      message: "El precio debe ser mayor o igual a 0.",
    }),
});
