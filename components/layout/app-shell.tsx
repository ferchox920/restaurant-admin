"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getNavigationItemForPath } from "@/lib/permissions/navigation";
import { LoadingState } from "@/components/feedback/loading-state";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-16">
        <LoadingState
          title="Cargando panel"
          message="Estamos preparando tu espacio de trabajo."
        />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const currentItem = getNavigationItemForPath(pathname);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,color-mix(in_oklch,var(--muted),white_35%)_0%,var(--background)_28rem)] lg:flex">
      <Sidebar role={user.role} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar user={user} currentItem={currentItem} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
