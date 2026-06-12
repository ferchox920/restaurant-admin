"use client";

import { appName } from "@/lib/env";
import type { AuthenticatedUser } from "@/features/auth/types/auth.types";
import type { NavigationItem } from "@/types/navigation";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";

type TopbarProps = {
  user: AuthenticatedUser;
  currentItem?: NavigationItem;
};

export function Topbar({ user, currentItem }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/92 backdrop-blur">
      <div className="flex min-h-18 items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <MobileNav role={user.role} />
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              {appName}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                {currentItem?.label ?? "Panel privado"}
              </h1>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {user.role}
              </span>
            </div>
          </div>
        </div>
        <UserMenu user={user} />
      </div>
    </header>
  );
}
