"use client";

import Link from "next/link";
import type { NavigationItem } from "@/types/navigation";
import { cn } from "@/lib/utils";

type NavItemProps = {
  item: NavigationItem;
  isActive: boolean;
  compact?: boolean;
  onNavigate?: () => void;
};

export function NavItem({
  item,
  isActive,
  compact = false,
  onNavigate,
}: NavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      title={compact ? item.label : undefined}
      className={cn(
        "group flex items-start gap-3 rounded-xl border px-3 py-3 text-sm transition-colors",
        compact && "justify-center px-2",
        isActive
          ? "border-sidebar-primary/20 bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "border-transparent text-sidebar-foreground hover:border-sidebar-border hover:bg-sidebar-accent"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
          isActive
            ? "bg-sidebar-primary-foreground/12"
            : "bg-sidebar-accent text-sidebar-accent-foreground"
        )}
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className={cn("min-w-0", compact && "sr-only")}>
        <span className="block font-medium">{item.label}</span>
        {item.description && !compact ? (
          <span
            className={cn(
              "mt-0.5 block text-xs",
              isActive
                ? "text-sidebar-primary-foreground/80"
                : "text-muted-foreground"
            )}
          >
            {item.description}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
