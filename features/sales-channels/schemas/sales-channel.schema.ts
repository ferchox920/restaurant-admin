import { z } from "zod";

export const salesChannelSubTaxSchema = z.object({
  name: z.string().trim().min(1, "El nombre del impuesto es obligatorio."),
  percentage: z
    .number({
      error: "El porcentaje debe ser un numero valido.",
    })
    .min(0, "El porcentaje no puede ser negativo.")
    .max(100, "El porcentaje no puede superar 100."),
});

export const salesChannelSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio."),
    code: z.string().trim().min(1, "El codigo es obligatorio."),
    description: z
      .string()
      .trim()
      .optional()
      .transform((value) => value ?? "")
      .transform((value) => (value.length > 0 ? value : undefined)),
    subTaxes: z.array(salesChannelSubTaxSchema).default([]),
  })
  .superRefine((value, context) => {
    const subTaxNames = new Set<string>();

    value.subTaxes.forEach((subTax, index) => {
      const normalizedName = subTax.name.trim().toLowerCase();

      if (subTaxNames.has(normalizedName)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["subTaxes", index, "name"],
          message: "Ya existe un impuesto con este nombre.",
        });
      }

      subTaxNames.add(normalizedName);
    });
  })
  .transform((value) => ({
    ...value,
    commissionType: "NONE" as const,
    commissionValue: 0,
  }));
