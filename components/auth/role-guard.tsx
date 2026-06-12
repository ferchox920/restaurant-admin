"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { canAccessRoute } from "@/lib/permissions/can-access-route";

type RoleGuardProps = {
  children: ReactNode;
};

export function RoleGuard({ children }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();

  const isAllowed = user ? canAccessRoute(user.role, pathname) : false;

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAllowed) {
      router.replace("/forbidden");
    }
  }, [isAllowed, isAuthenticated, isLoading, router]);

  if (!isAuthenticated || isLoading) {
    return null;
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
