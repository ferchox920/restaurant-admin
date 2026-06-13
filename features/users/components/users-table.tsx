import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserActions } from "@/features/users/components/user-actions";
import { UserRoleBadge } from "@/features/users/components/user-role-badge";
import { UserStatusBadge } from "@/features/users/components/user-status-badge";
import type { User } from "@/features/users/types/user.types";
import { formatDateTime } from "@/lib/formatters";

function formatLastLogin(lastLoginAt: string | null) {
  return lastLoginAt ? formatDateTime(lastLoginAt) : "Nunca inicio sesion";
}

type UsersTableProps = {
  users: User[];
  canMutate: boolean;
};

export function UsersTable({ users, canMutate }: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuario</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Ultimo login</TableHead>
          <TableHead>Creado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow
            key={user.id}
            className={!user.active ? "bg-muted/30 text-muted-foreground" : ""}
          >
            <TableCell className="font-medium text-foreground">
              <Link href={`/users/${user.id}`} className="underline-offset-4 hover:underline">
                {user.firstName} {user.lastName}
              </Link>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <UserRoleBadge role={user.role} />
            </TableCell>
            <TableCell>
              <UserStatusBadge active={user.active} />
            </TableCell>
            <TableCell>{formatLastLogin(user.lastLoginAt)}</TableCell>
            <TableCell>{formatDateTime(user.createdAt)}</TableCell>
            <TableCell>
              <UserActions user={user} canMutate={canMutate} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
