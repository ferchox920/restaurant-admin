import { z } from "zod";

export const paymentBankSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "")
    .transform((value) => (value.length > 0 ? value : undefined)),
});
