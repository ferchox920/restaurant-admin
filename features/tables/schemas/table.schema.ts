import { z } from "zod";

function optionalText(value: string | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : undefined;
}

const optionalCapacitySchema = z
  .preprocess(
    (value) => {
      if (value === "" || value == null) {
        return undefined;
      }

      return Number(value);
    },
    z
      .number({
        message: "La capacidad debe ser un numero.",
      })
      .int("La capacidad debe ser un entero.")
      .positive("La capacidad debe ser mayor que 0.")
      .optional()
  );

export const createTableSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "El codigo es obligatorio.")
    .transform((value) => value.trim()),
  name: z.string().optional().transform(optionalText),
  area: z.string().optional().transform(optionalText),
  capacity: optionalCapacitySchema,
});

export const updateTableSchema = z.object({
  name: z.string().optional().transform(optionalText),
  area: z.string().optional().transform(optionalText),
  capacity: optionalCapacitySchema,
});
