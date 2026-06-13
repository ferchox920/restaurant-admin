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
      }),
  })
  .superRefine((value, context) => {
    if (
      value.commissionType === "PERCENTAGE" &&
      (value.commissionValue < -100 || value.commissionValue > 100)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["commissionValue"],
        message: "La comision porcentual debe estar entre -100 y 100.",
      });
    }

    if (value.commissionType === "FIXED" && value.commissionValue < 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["commissionValue"],
        message: "La comision fija no puede ser negativa.",
      });
    }
  })
  .transform((value) => ({
    ...value,
    commissionValue:
      value.commissionType === "NONE" ? 0 : value.commissionValue,
  }));
