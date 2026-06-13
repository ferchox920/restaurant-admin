import type { UserRole } from "@/features/users/types/user.types";

export type UserOption = {
  id: string;
  label: string;
  email: string;
  role: UserRole;
  active: boolean;
};
