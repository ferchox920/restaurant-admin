import { z } from "zod";

export const userRoles = ["ADMIN", "MANAGER", "CASHIER", "AUDITOR"] as const;

export type UserRole = (typeof userRoles)[number];

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserListItem = User;

export type CreateUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

export type UpdateUserInput = {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
};

export type UserFilters = {
  search?: string;
  active?: boolean;
  role?: UserRole;
};

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(userRoles),
  active: z.boolean(),
  lastLoginAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
