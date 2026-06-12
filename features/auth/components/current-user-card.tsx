"use client";

import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function CurrentUserCard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <LoadingState
        title="Dashboard"
        message="Validando sesión antes de cargar los datos del usuario."
      />
    );
  }

  if (!user) {
    return (
      <EmptyState
        title="Dashboard"
        message="No hay datos de usuario disponibles para esta sesión."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="text-muted-foreground">Nombre</p>
          <p className="font-medium">
            {user.firstName} {user.lastName}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Rol</p>
          <p className="font-medium">{user.role}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Estado</p>
          <p className="font-medium">Sesion activa</p>
        </div>
      </CardContent>
    </Card>
  );
}
