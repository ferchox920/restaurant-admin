import { z } from "zod";
import { isQuantityInputValid, normalizeQuantityInput } from "@/lib/quantity";

function optionalText(value: string | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : undefined;
}

function quantityStringSchema(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} es obligatoria.`)
    .refine((value) => isQuantityInputValid(value), {
      message: `${label} debe ser un decimal valido sin separadores de miles.`,
    })
    .refine((value) => Number(normalizeQuantityInput(value)) > 0, {
      message: `${label} debe ser mayor que 0.`,
    });
}

export const openTableOrderSchema = z.object({
  salesChannelId: z.string().uuid("Selecciona un canal valido."),
  notes: z.string().optional().transform(optionalText),
});

export const addTableOrderItemSchema = z.object({
  productId: z.string().uuid("Selecciona un producto valido."),
  quantity: quantityStringSchema("La cantidad"),
});

export const updateTableOrderItemSchema = z.object({
  quantity: quantityStringSchema("La cantidad"),
});

export const cancelTableOrderSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "El motivo es obligatorio.")
    .transform((value) => value.trim()),
});

export const closeTableOrderSchema = z
  .object({
    paymentMethod: z.enum(["CASH", "TRANSFER"], {
      message: "Selecciona un metodo de cierre valido.",
    }),
    paymentBankId: z
      .string()
      .uuid("Selecciona un banco valido.")
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : undefined)),
  })
  .superRefine((value, context) => {
    if (value.paymentMethod === "TRANSFER" && !value.paymentBankId) {
      context.addIssue({
        code: "custom",
        path: ["paymentBankId"],
        message: "Selecciona un banco para transferencia.",
      });
    }
  })
  .transform((value) => ({
    paymentMethod: value.paymentMethod,
    ...(value.paymentMethod === "TRANSFER"
      ? { paymentBankId: value.paymentBankId }
      : {}),
  }));
