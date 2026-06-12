"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingState } from "@/components/feedback/loading-state";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { HTTP_STATUS } from "@/lib/api/http-status";

type PrivateRouteProps = {
  children: ReactNode;
};

export function PrivateRoute({ children }: PrivateRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, authErrorStatus } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  useEffect(() => {
    if (isAuthenticated && authErrorStatus === HTTP_STATUS.forbidden) {
      router.replace("/forbidden");
    }
  }, [authErrorStatus, isAuthenticated, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-16">
        <LoadingState
          title="Validando sesion"
          message="Estamos verificando tu acceso antes de mostrar el panel."
        />
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
