"use client";

import { usePathname } from "next/navigation";
import { getNavigationForRole } from "@/lib/permissions/navigation";
import type { UserRole } from "@/types/roles";
import { AppLogo } from "@/components/layout/app-logo";
import { NavItem } from "@/components/layout/nav-item";

type SidebarProps = {
  role: UserRole;
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const navigation = getNavigationForRole(role);

  return (
    <aside className="hidden w-80 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:min-h-screen">
      <div className="flex w-full flex-col gap-6 px-5 py-6">
        <AppLogo />
        <div className="space-y-2">
          <p className="px-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Navegacion
          </p>
          <nav className="space-y-2">
            {navigation.map((item) => (
              <NavItem
                key={item.href}
                item={item}
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
