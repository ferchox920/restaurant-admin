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
import { Textarea } from "@/components/ui/textarea";
import { ErrorMessage } from "@/components/feedback/error-message";
import { categorySchema } from "@/features/categories/schemas/category.schema";
import type { CreateCategoryInput } from "@/features/categories/types/category.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";

const categoryFormSchema = categorySchema;

type CategoryFormValues = z.input<typeof categoryFormSchema>;
type CategoryFormSubmitValues = z.output<typeof categoryFormSchema>;

type CategoryFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  initialValues?: Partial<CreateCategoryInput>;
  isPending?: boolean;
  error?: unknown;
  onSubmit: (values: CategoryFormSubmitValues) => Promise<void> | void;
};

export function CategoryForm({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  initialValues,
  isPending = false,
  error,
  onSubmit,
}: CategoryFormProps) {
  const form = useForm<
    CategoryFormValues,
    undefined,
    CategoryFormSubmitValues
  >({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        name: initialValues?.name ?? "",
        description: initialValues?.description ?? "",
      });
      return;
    }

    form.reset({
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
    });
  }, [form, initialValues, open]);

  const errorTitle =
    error && isApiError(error) && error.statusCode === HTTP_STATUS.conflict
      ? "Conflicto al guardar la categoria"
      : "No se pudo guardar la categoria";

  async function handleSubmit(values: CategoryFormSubmitValues) {
    await onSubmit(values);
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
          <div className="space-y-2">
            <Label htmlFor="category-name">Nombre</Label>
            <Input
              id="category-name"
              placeholder="Ej. Cafeteria"
              disabled={isPending}
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">Descripcion</Label>
            <Textarea
              id="category-description"
              placeholder="Descripcion operativa de la categoria"
              disabled={isPending}
              aria-invalid={Boolean(form.formState.errors.description)}
              {...form.register("description")}
            />
            {form.formState.errors.description ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

          {error ? (
            <ErrorMessage
              variant="general"
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
              {isPending ? "Guardando..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
