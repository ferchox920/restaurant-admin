"use client";

import { ChevronDown, ShieldCheck } from "lucide-react";
import { LogoutButton } from "@/features/auth/components/logout-button";
import type { AuthenticatedUser } from "@/features/auth/types/auth.types";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  user: AuthenticatedUser;
};

export function UserMenu({ user }: UserMenuProps) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-left shadow-sm transition-colors hover:bg-muted">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {user.firstName.charAt(0)}
          {user.lastName.charAt(0)}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm font-medium">
            {user.firstName} {user.lastName}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-border bg-card p-4 shadow-xl">
        <div className="space-y-1">
          <p className="text-sm font-semibold">
            {user.firstName} {user.lastName}
          </p>
          <p className="break-all text-xs text-muted-foreground">{user.email}</p>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="size-4" />
          <span className={cn("tracking-wide")}>{user.role}</span>
        </div>
        <div className="mt-4">
          <LogoutButton className="w-full justify-center" />
        </div>
      </div>
    </details>
  );
}
