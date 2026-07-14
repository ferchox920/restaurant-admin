"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { getNavigationForRole } from "@/lib/permissions/navigation";
import type { UserRole } from "@/types/roles";
import { AppLogo } from "@/components/layout/app-logo";
import { NavItem } from "@/components/layout/nav-item";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarProps = {
  role: UserRole;
};

export function Sidebar({ role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const navigation = getNavigationForRole(role);
  const navigationHeadingId = "sidebar-navigation-heading";

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out lg:flex lg:min-h-screen",
        collapsed ? "w-20" : "w-80"
      )}
      data-collapsed={collapsed}
    >
      <div
        className={cn(
          "flex w-full flex-col gap-6 py-6",
          collapsed ? "px-3" : "px-5"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed ? "flex-col justify-center" : "justify-between"
          )}
        >
          <AppLogo compact={collapsed} className={collapsed ? "px-0" : ""} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={
              collapsed ? "Expandir barra lateral" : "Contraer barra lateral"
            }
            aria-pressed={collapsed}
            onClick={() => setCollapsed((current) => !current)}
            className="shrink-0"
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-4" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-4" />
            )}
          </Button>
        </div>
        <div className="space-y-2">
          <p
            id={navigationHeadingId}
            className={cn(
              "px-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase",
              collapsed && "sr-only"
            )}
          >
            Navegacion
          </p>
          <nav aria-labelledby={navigationHeadingId} className="space-y-2">
            {navigation.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                compact={collapsed}
                isActive={
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                }
              />
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}
