import type { UserRole } from "@/types/roles";

export type AuthenticatedUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user?: AuthenticatedUser;
};

export type AuthMeResponse = AuthenticatedUser;
