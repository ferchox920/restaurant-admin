"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { getNavigationForRole } from "@/lib/permissions/navigation";
import type { UserRole } from "@/types/roles";
import { AppLogo } from "@/components/layout/app-logo";
import { Button } from "@/components/ui/button";
import { NavItem } from "@/components/layout/nav-item";
import { usePathname } from "next/navigation";

type MobileNavProps = {
  role: UserRole;
};

export function MobileNav({ role }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const navigation = getNavigationForRole(role);
  const panelId = "mobile-navigation-panel";

  return (
    <div className="lg:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={open ? "Cerrar menu" : "Abrir menu"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <X aria-hidden="true" className="size-4" />
        ) : (
          <Menu aria-hidden="true" className="size-4" />
        )}
      </Button>
      {open ? (
        <div
          id={panelId}
          className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/98 px-4 py-4 shadow-lg backdrop-blur"
        >
          <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-4">
            <AppLogo className="px-0" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Cerrar menu"
              onClick={() => setOpen(false)}
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          </div>
          <nav
            aria-label="Navegacion principal"
            className="mx-auto mt-5 flex w-full max-w-7xl flex-col gap-2 pb-2"
          >
            {navigation.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                }
                onNavigate={() => setOpen(false)}
              />
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
