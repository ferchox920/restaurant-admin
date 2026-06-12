import { z } from "zod";
import { commissionTypes } from "@/features/sales-channels/types/sales-channel.types";

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
    commissionType: z.enum(commissionTypes, {
      message: "Selecciona un tipo de comision valido.",
    }),
    commissionValue: z
      .number({
        error: "La comision debe ser un numero valido.",
      })
      .min(0, "La comision no puede ser negativa."),
  })
  .superRefine((value, context) => {
    if (value.commissionType === "PERCENTAGE" && value.commissionValue > 100) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["commissionValue"],
        message: "La comision porcentual no puede superar 100.",
      });
    }
  })
  .transform((value) => ({
    ...value,
    commissionValue:
      value.commissionType === "NONE" ? 0 : value.commissionValue,
  }));
