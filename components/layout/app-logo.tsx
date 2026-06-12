"use client";

import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  compact?: boolean;
  className?: string;
};

export function AppLogo({ compact = false, className }: AppLogoProps) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "group inline-flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-sidebar-accent",
        className
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
        <UtensilsCrossed className="size-5" />
      </span>
      {!compact ? (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-sidebar-foreground">
            Restaurant Admin
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            Panel administrativo
          </span>
        </span>
      ) : null}
    </Link>
  );
}
