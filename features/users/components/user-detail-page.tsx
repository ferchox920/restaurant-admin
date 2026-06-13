"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { SuccessMessage } from "@/components/feedback/success-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { DeactivateUserDialog } from "@/features/users/components/deactivate-user-dialog";
import { ReactivateUserDialog } from "@/features/users/components/reactivate-user-dialog";
import { UpdateUserForm } from "@/features/users/components/update-user-form";
import { UserProfileCard } from "@/features/users/components/user-profile-card";
import { UserSecurityNotice } from "@/features/users/components/user-security-notice";
import { useDeactivateUser } from "@/features/users/hooks/use-deactivate-user";
import { useReactivateUser } from "@/features/users/hooks/use-reactivate-user";
import { useUpdateUser } from "@/features/users/hooks/use-update-user";
import { useUser } from "@/features/users/hooks/use-user";
import type { UpdateUserInput } from "@/features/users/types/user.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";

export function UserDetailPage({ userId }: { userId: string }) {
  const { user: currentUser } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const userQuery = useUser(userId);
  const updateUserMutation = useUpdateUser();
  const deactivateUserMutation = useDeactivateUser();
  const reactivateUserMutation = useReactivateUser();

  const isForbidden =
    userQuery.error &&
    isApiError(userQuery.error) &&
    userQuery.error.statusCode === HTTP_STATUS.forbidden;
  const isNotFound =
    userQuery.error &&
    isApiError(userQuery.error) &&
    userQuery.error.statusCode === HTTP_STATUS.notFound;

  async function handleUpdateUser(values: UpdateUserInput) {
    await updateUserMutation.mutateAsync({
      userId,
      data: values,
    });
    setSuccessMessage("Los datos basicos del usuario se actualizaron.");
  }

  async function handleDeactivateUser() {
    await deactivateUserMutation.mutateAsync(userId);
    setSuccessMessage("El usuario fue desactivado.");
  }

  async function handleReactivateUser() {
    await reactivateUserMutation.mutateAsync(userId);
    setSuccessMessage("El usuario fue reactivado.");
  }

  if (userQuery.isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <LoadingState
          title="Cargando usuario"
          message="Estamos preparando el detalle del usuario."
          className="w-full max-w-none shadow-none"
        />
      </section>
    );
  }

  if (userQuery.error) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <PageHeader
          eyebrow="Usuarios"
          title="Detalle de usuario"
          description="Vista administrativa del perfil y estado del usuario."
        />
        <ErrorMessage
          variant={isForbidden ? "forbidden" : "general"}
          title={
            isForbidden
              ? "Acceso restringido"
              : isNotFound
                ? "Usuario no encontrado"
                : "No se pudo cargar el usuario"
          }
          messages={
            isNotFound
              ? "El usuario solicitado no existe o ya no esta disponible."
              : getApiErrorMessages(userQuery.error)
          }
        />
      </section>
    );
  }

  const user = userQuery.data;

  if (!user) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <EmptyState
          title="Sin datos"
          message="No se encontro informacion del usuario."
          className="w-full max-w-none shadow-none"
        />
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        eyebrow="Usuarios"
        title={`${user.firstName} ${user.lastName}`}
        description="Detalle administrativo con edicion de datos basicos y cambios explicitos de estado."
        actions={
          <Link href="/users" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Volver al listado
          </Link>
        }
      />

      {successMessage ? (
        <SuccessMessage message={successMessage} />
      ) : null}

      <UserProfileCard user={user} />
      <UserSecurityNotice />

      <Card>
        <CardHeader>
          <CardTitle>Actualizar datos basicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <UpdateUserForm
            user={user}
            isPending={updateUserMutation.isPending}
            error={updateUserMutation.error}
            onSubmit={handleUpdateUser}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado del usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {user.active
              ? "Desactivar usuario mantiene el historial pero impide futuros inicios de sesion."
              : "Reactivar vuelve a habilitar el acceso del usuario."}
          </p>

          {user.active ? (
            <DeactivateUserDialog
              user={user}
              isSelf={currentUser?.id === user.id}
              isPending={deactivateUserMutation.isPending}
              onConfirm={handleDeactivateUser}
            />
          ) : (
            <ReactivateUserDialog
              user={user}
              isPending={reactivateUserMutation.isPending}
              onConfirm={handleReactivateUser}
            />
          )}

          {deactivateUserMutation.error ? (
            <ErrorMessage
              title="No se pudo desactivar el usuario"
              messages={getApiErrorMessages(deactivateUserMutation.error)}
            />
          ) : null}

          {reactivateUserMutation.error ? (
            <ErrorMessage
              title="No se pudo reactivar el usuario"
              messages={getApiErrorMessages(reactivateUserMutation.error)}
            />
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
