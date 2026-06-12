import { ReactNode } from "react";
import { PrivateRoute } from "@/components/auth/private-route";
import { RoleGuard } from "@/components/auth/role-guard";
import { AppShell } from "@/components/layout/app-shell";

type PrivateLayoutProps = {
  children: ReactNode;
};

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <PrivateRoute>
      <RoleGuard>
        <AppShell>{children}</AppShell>
      </RoleGuard>
    </PrivateRoute>
  );
}
