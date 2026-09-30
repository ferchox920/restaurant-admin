import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRoleBadge } from "@/features/users/components/user-role-badge";
import { UserStatusBadge } from "@/features/users/components/user-status-badge";
import type { User } from "@/features/users/types/user.types";
import { formatDateTime } from "@/lib/formatters";

function formatLastLogin(lastLoginAt: string | null) {
  return lastLoginAt ? formatDateTime(lastLoginAt) : "Nunca inicio sesion";
}

export function UserProfileCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader className="gap-3">
        <CardTitle className="flex flex-wrap items-center justify-between gap-3">
          <span>Perfil</span>
          <div className="flex flex-wrap items-center gap-2">
            <UserRoleBadge role={user.role} />
            <UserStatusBadge active={user.active} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Nombre</p>
          <p>{user.firstName}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Apellido</p>
          <p>{user.lastName}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          <p>{user.email}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Ultimo login
          </p>
          <p>{formatLastLogin(user.lastLoginAt)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Creado</p>
          <p>{formatDateTime(user.createdAt)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Actualizado
          </p>
          <p>{formatDateTime(user.updatedAt)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
