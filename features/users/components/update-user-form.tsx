"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorMessage } from "@/components/feedback/error-message";
import { updateUserSchema } from "@/features/users/schemas/user.schema";
import type { User } from "@/features/users/types/user.types";
import { userRoles } from "@/features/users/types/user.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";
import { formatUserRole } from "@/lib/formatters";

type UpdateUserFormValues = z.input<typeof updateUserSchema>;
type UpdateUserFormSubmitValues = z.output<typeof updateUserSchema>;

type UpdateUserFormProps = {
  user: User;
  isPending?: boolean;
  error?: unknown;
  onSubmit: (values: UpdateUserFormSubmitValues) => Promise<void> | void;
};

export function UpdateUserForm({
  user,
  isPending = false,
  error,
  onSubmit,
}: UpdateUserFormProps) {
  const [roleChangeConfirmed, setRoleChangeConfirmed] = useState(false);
  const form = useForm<UpdateUserFormValues, undefined, UpdateUserFormSubmitValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });

  useEffect(() => {
    form.reset({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
  }, [form, user]);

  const selectedRole = useWatch({
    control: form.control,
    name: "role",
  });
  const hasRoleChange = selectedRole && selectedRole !== user.role;
  const errorTitle =
    error && isApiError(error) && error.statusCode === HTTP_STATUS.conflict
      ? "Conflicto al actualizar"
      : "No se pudo actualizar el usuario";

  async function handleSubmit(values: UpdateUserFormSubmitValues) {
    if (hasRoleChange && !roleChangeConfirmed) {
      return;
    }

    const payload = Object.fromEntries(
      Object.entries(values).filter(([key, value]) => {
        const currentValue = user[key as keyof UpdateUserFormSubmitValues];
        return value !== undefined && value !== currentValue;
      })
    ) as UpdateUserFormSubmitValues;

    await onSubmit(payload);
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="update-user-first-name">Nombre</Label>
          <Input
            id="update-user-first-name"
            disabled={isPending}
            {...form.register("firstName")}
          />
          {form.formState.errors.firstName ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.firstName.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="update-user-last-name">Apellido</Label>
          <Input
            id="update-user-last-name"
            disabled={isPending}
            {...form.register("lastName")}
          />
          {form.formState.errors.lastName ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.lastName.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="update-user-email">Email</Label>
          <Input
            id="update-user-email"
            type="email"
            disabled={isPending}
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Rol</Label>
          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  setRoleChangeConfirmed(false);
                  field.onChange(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un rol">
                    {(value) =>
                      value ? formatUserRole(value) : "Selecciona un rol"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {formatUserRole(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.role ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.role.message}
            </p>
          ) : null}
        </div>
      </div>

      {hasRoleChange ? (
        <label className="flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-3 text-sm text-amber-950">
          <input
            type="checkbox"
            className="mt-1"
            checked={roleChangeConfirmed}
            disabled={isPending}
            onChange={(event) => setRoleChangeConfirmed(event.target.checked)}
          />
          <span>
            Confirmo que cambiar el rol de <strong>{user.firstName} {user.lastName}</strong> es una accion sensible.
          </span>
        </label>
      ) : null}

      {error ? (
        <ErrorMessage title={errorTitle} messages={getApiErrorMessages(error)} />
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || (hasRoleChange && !roleChangeConfirmed)}>
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
