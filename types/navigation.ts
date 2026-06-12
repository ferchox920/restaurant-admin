import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/types/roles";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  module: string;
  description?: string;
  sprint?: string;
};
