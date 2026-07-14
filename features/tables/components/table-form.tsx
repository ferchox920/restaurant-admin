"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { ErrorMessage } from "@/components/feedback/error-message";
import {
  createTableSchema,
  updateTableSchema,
} from "@/features/tables/schemas/table.schema";
import type { CreateTableInput, UpdateTableInput } from "@/features/tables/types/table.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";

type TableFormMode = "create" | "update";

type TableFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: TableFormMode;
  title: string;
  description: string;
  submitLabel: string;
  initialValues?: Partial<CreateTableInput>;
  isPending?: boolean;
  error?: unknown;
  onSubmit: (values: CreateTableInput | UpdateTableInput) => Promise<void> | void;
};

export function TableForm({
  open,
  onOpenChange,
  mode,
  title,
  description,
  submitLabel,
  initialValues,
  isPending = false,
  error,
  onSubmit,
}: TableFormProps) {
  const schema = mode === "create" ? createTableSchema : updateTableSchema;
  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: initialValues?.code ?? "",
      name: initialValues?.name ?? "",
      area: initialValues?.area ?? "",
      capacity: initialValues?.capacity?.toString() ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      code: initialValues?.code ?? "",
      name: initialValues?.name ?? "",
      area: initialValues?.area ?? "",
      capacity: initialValues?.capacity?.toString() ?? "",
    });
  }, [form, initialValues, open]);

  const errorTitle =
    error && isApiError(error) && error.statusCode === HTTP_STATUS.conflict
      ? "Conflicto al guardar la mesa"
      : "No se pudo guardar la mesa";

  async function handleSubmit(values: Record<string, unknown>) {
    const parsed = schema.parse(values) as z.output<typeof schema>;
    await onSubmit(parsed);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending && !nextOpen) {
          return;
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          {mode === "create" ? (
            <div className="space-y-2">
              <Label htmlFor="table-code">Código</Label>
              <Input
                id="table-code"
                disabled={isPending}
                aria-invalid={Boolean(form.formState.errors.code)}
                {...form.register("code")}
              />
              {form.formState.errors.code ? (
                <p className="text-sm text-destructive">
                  {String(form.formState.errors.code.message)}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="table-name">
                Nombre <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="table-name"
                disabled={isPending}
                {...form.register("name")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="table-area">
                Área <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="table-area"
                disabled={isPending}
                {...form.register("area")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="table-capacity">
              Capacidad <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="table-capacity"
              type="number"
              min={1}
              step={1}
              disabled={isPending}
              aria-invalid={Boolean(form.formState.errors.capacity)}
              {...form.register("capacity")}
            />
            {form.formState.errors.capacity ? (
              <p className="text-sm text-destructive">
                {String(form.formState.errors.capacity.message)}
              </p>
            ) : null}
          </div>

          {error ? (
            <ErrorMessage title={errorTitle} messages={getApiErrorMessages(error)} />
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
              {isPending ? "Guardando..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
