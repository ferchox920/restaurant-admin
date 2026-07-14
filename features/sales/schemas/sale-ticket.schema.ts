import { z } from "zod";
import { isQuantityInputValid, normalizeQuantityInput } from "@/lib/quantity";

function normalizeOptionalText(value: string | undefined) {
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

export const salePaymentMethodSchema = z.enum(["CASH", "TRANSFER"], {
  message: "Selecciona un metodo de pago valido.",
});

export const saleTicketPaymentSchema = z
  .object({
    paymentMethod: salePaymentMethodSchema,
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
        message: "Selecciona un banco para la transferencia.",
      });
    }
  })
  .transform((value) => ({
    paymentMethod: value.paymentMethod,
    ...(value.paymentMethod === "TRANSFER"
      ? { paymentBankId: value.paymentBankId }
      : {}),
  }));

export const createSaleTicketSchema = z.object({
  salesChannelId: z.string().uuid("Selecciona un canal valido."),
  notes: z
    .string()
    .optional()
    .transform((value) => normalizeOptionalText(value)),
  paymentMethod: salePaymentMethodSchema.optional(),
  paymentBankId: z.string().uuid("Selecciona un banco valido.").optional(),
});

export const updateSaleTicketItemSchema = z.object({
  quantity: quantityStringSchema("La cantidad"),
});

export const voidSaleTicketSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "El motivo es obligatorio.")
    .transform((value) => value.trim()),
});
