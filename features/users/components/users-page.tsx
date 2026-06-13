"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { SuccessMessage } from "@/components/feedback/success-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { CreateUserForm } from "@/features/users/components/create-user-form";
import { UserFilters } from "@/features/users/components/user-filters";
import { UsersTable } from "@/features/users/components/users-table";
import { useCreateUser } from "@/features/users/hooks/use-create-user";
import { useUsers } from "@/features/users/hooks/use-users";
import type { User } from "@/features/users/types/user.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";

type UserFilterState = {
  search: string;
  active: "all" | "active" | "inactive";
  role: "all" | User["role"];
};

const defaultFilters: UserFilterState = {
  search: "",
  active: "all",
  role: "all",
};

export function UsersPage() {
  const { user } = useAuth();
  const canMutate = user?.role === "ADMIN";
  const [filters, setFilters] = useState<UserFilterState>(defaultFilters);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(filters.search.trim().toLowerCase());

  const usersQuery = useUsers();
  const createUserMutation = useCreateUser();
  const isForbiddenQuery =
    usersQuery.error &&
    isApiError(usersQuery.error) &&
    usersQuery.error.statusCode === HTTP_STATUS.forbidden;

  const visibleUsers = useMemo(() => {
    let source = usersQuery.data ?? [];

    if (filters.active !== "all") {
      source = source.filter((item) =>
        filters.active === "active" ? item.active : !item.active
      );
    }

    if (filters.role !== "all") {
      source = source.filter((item) => item.role === filters.role);
    }

    if (deferredSearch) {
      source = source.filter((item) =>
        `${item.firstName} ${item.lastName} ${item.email}`
          .toLowerCase()
          .includes(deferredSearch)
      );
    }

    return source;
  }, [deferredSearch, filters.active, filters.role, usersQuery.data]);

  async function handleCreateUser(values: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: User["role"];
  }) {
    const createdUser = await createUserMutation.mutateAsync(values);
    setSuccessMessage(`Se creo ${createdUser.firstName} ${createdUser.lastName} correctamente.`);
    setIsCreateOpen(false);
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Usuarios"
        title="Gestion de usuarios"
        description="Listado administrativo de usuarios internos con alta y navegacion al detalle."
        actions={
          canMutate ? (
            <Button type="button" onClick={() => setIsCreateOpen(true)}>
              <Plus data-icon="inline-start" />
              Nuevo usuario
            </Button>
          ) : null
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-5">
          <UserFilters values={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} />

          {successMessage ? (
            <SuccessMessage title="Usuario creado" message={successMessage} />
          ) : null}

          {usersQuery.isLoading ? (
            <LoadingState
              title="Cargando usuarios"
              message="Estamos consultando la lista real de usuarios."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {usersQuery.error ? (
            <ErrorMessage
              variant={isForbiddenQuery ? "forbidden" : "general"}
              title={isForbiddenQuery ? "Acceso restringido" : "No se pudo cargar el listado"}
              messages={getApiErrorMessages(usersQuery.error)}
            />
          ) : null}

          {!usersQuery.isLoading && !usersQuery.error && visibleUsers.length === 0 ? (
            <EmptyState
              title="Sin usuarios"
              message="No hay usuarios para mostrar con los filtros aplicados."
              className="w-full max-w-none shadow-none"
            />
          ) : null}

          {!usersQuery.isLoading && !usersQuery.error && visibleUsers.length > 0 ? (
            <UsersTable users={visibleUsers} canMutate={canMutate} />
          ) : null}
        </CardContent>
      </Card>

      <CreateUserForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        isPending={createUserMutation.isPending}
        error={createUserMutation.error}
        onSubmit={handleCreateUser}
      />
    </section>
  );
}
