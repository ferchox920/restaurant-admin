import { z } from "zod";
import { userRoles } from "@/features/users/types/user.types";

export const createUserSchema = z.object({
  email: z.string().trim().email("Ingresa un email valido."),
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres."),
  firstName: z.string().trim().min(1, "El nombre es obligatorio."),
  lastName: z.string().trim().min(1, "El apellido es obligatorio."),
  role: z.enum(userRoles, {
    message: "Selecciona un rol valido.",
  }),
});

export const updateUserSchema = z
  .object({
    email: z.string().trim().email("Ingresa un email valido.").optional(),
    firstName: z.string().trim().min(1, "El nombre es obligatorio.").optional(),
    lastName: z.string().trim().min(1, "El apellido es obligatorio.").optional(),
    role: z
      .enum(userRoles, {
        message: "Selecciona un rol valido.",
      })
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Debes modificar al menos un campo.",
  });
