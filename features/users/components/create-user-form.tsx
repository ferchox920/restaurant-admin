"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorMessage } from "@/components/feedback/error-message";
import { createUserSchema } from "@/features/users/schemas/user.schema";
import { userRoles } from "@/features/users/types/user.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";
import { formatUserRole } from "@/lib/formatters";

type CreateUserFormValues = z.input<typeof createUserSchema>;
type CreateUserFormSubmitValues = z.output<typeof createUserSchema>;

type CreateUserFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending?: boolean;
  error?: unknown;
  onSubmit: (values: CreateUserFormSubmitValues) => Promise<void> | void;
};

const defaultValues: CreateUserFormValues = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  role: "CASHIER",
};

export function CreateUserForm({
  open,
  onOpenChange,
  isPending = false,
  error,
  onSubmit,
}: CreateUserFormProps) {
  const form = useForm<
    CreateUserFormValues,
    undefined,
    CreateUserFormSubmitValues
  >({
    resolver: zodResolver(createUserSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
    }
  }, [form, open]);

  const errorTitle =
    error && isApiError(error) && error.statusCode === HTTP_STATUS.conflict
      ? "Email duplicado"
      : "No se pudo crear el usuario";

  async function handleSubmit(values: CreateUserFormSubmitValues) {
    await onSubmit(values);
    form.reset(defaultValues);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending && !nextOpen) {
          return;
        }

        if (!nextOpen) {
          form.reset(defaultValues);
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-xl" showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
          <DialogDescription>
            Crea un usuario interno del panel. La contrasena solo se usa en este
            alta y no vuelve a mostrarse.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create-user-first-name">Nombre</Label>
              <Input
                id="create-user-first-name"
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
              <Label htmlFor="create-user-last-name">Apellido</Label>
              <Input
                id="create-user-last-name"
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

          <div className="space-y-2">
            <Label htmlFor="create-user-email">Email</Label>
            <Input
              id="create-user-email"
              type="email"
              autoComplete="off"
              inputMode="email"
              disabled={isPending}
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create-user-password">Contrasena</Label>
              <Input
                id="create-user-password"
                type="password"
                autoComplete="new-password"
                disabled={isPending}
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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

          {error ? (
            <ErrorMessage
              title={errorTitle}
              messages={getApiErrorMessages(error)}
            />
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando..." : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
