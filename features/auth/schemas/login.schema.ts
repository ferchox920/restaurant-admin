import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Ingresa un email valido."),
  password: z.string().min(1, "Ingresa tu password."),
});

export type LoginSchema = z.infer<typeof loginSchema>;
