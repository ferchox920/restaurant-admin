"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
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
import type { CreateSalesChannelInput } from "@/features/sales-channels/types/sales-channel.types";
import { salesChannelSchema } from "@/features/sales-channels/schemas/sales-channel.schema";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";

const salesChannelFormSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio."),
    code: z.string().trim().min(1, "El codigo es obligatorio."),
    description: z.string().trim().optional(),
    subTaxes: z
      .array(
        z.object({
          name: z.string().trim().min(1, "El nombre es obligatorio."),
          percentage: z.coerce
            .number({
              error: "El porcentaje debe ser un numero valido.",
            })
            .min(0, "No puede ser negativo.")
            .max(100, "No puede superar 100."),
        })
      )
      .default([]),
  })
  .superRefine((value, context) => {
    const subTaxNames = new Set<string>();

    value.subTaxes.forEach((subTax, index) => {
      const normalizedName = subTax.name.trim().toLowerCase();

      if (subTaxNames.has(normalizedName)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["subTaxes", index, "name"],
          message: "Ya existe un impuesto con este nombre.",
        });
      }

      subTaxNames.add(normalizedName);
    });
  });

type SalesChannelFormValues = z.input<typeof salesChannelFormSchema>;
type SalesChannelFormResolvedValues = z.output<typeof salesChannelFormSchema>;
type SalesChannelFormSubmitValues = z.output<typeof salesChannelSchema>;

type SalesChannelFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  initialValues?: Partial<CreateSalesChannelInput>;
  isPending?: boolean;
  error?: unknown;
  onSubmit: (values: SalesChannelFormSubmitValues) => Promise<void> | void;
};

export function SalesChannelForm({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  initialValues,
  isPending = false,
  error,
  onSubmit,
}: SalesChannelFormProps) {
  const form = useForm<
    SalesChannelFormValues,
    undefined,
    SalesChannelFormResolvedValues
  >({
    resolver: zodResolver(salesChannelFormSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      code: initialValues?.code ?? "",
      description: initialValues?.description ?? "",
      subTaxes: initialValues?.subTaxes ?? [],
    },
  });

  const subTaxes = useFieldArray({
    control: form.control,
    name: "subTaxes",
  });

  useEffect(() => {
    const nextValues = {
      name: initialValues?.name ?? "",
      code: initialValues?.code ?? "",
      description: initialValues?.description ?? "",
      subTaxes: initialValues?.subTaxes ?? [],
    };

    form.reset(nextValues);
  }, [form, initialValues, open]);

  const errorTitle =
    error && isApiError(error) && error.statusCode === HTTP_STATUS.conflict
      ? "Conflicto al guardar el canal"
      : "No se pudo guardar el canal";

  async function handleSubmit(values: SalesChannelFormResolvedValues) {
    await onSubmit(salesChannelSchema.parse(values));
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
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        showCloseButton={!isPending}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sales-channel-name">Nombre</Label>
              <Input
                id="sales-channel-name"
                placeholder="Ej. Pedidos Ya"
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
              <Label htmlFor="sales-channel-code">Código interno</Label>
              <Input
                id="sales-channel-code"
                placeholder="Ej. PEDIDOSYA"
                disabled={isPending}
                aria-invalid={Boolean(form.formState.errors.code)}
                {...form.register("code")}
              />
              {form.formState.errors.code ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.code.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Identificador breve para reconocer el canal.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sales-channel-description">
              Descripción{" "}
              <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="sales-channel-description"
              placeholder="Descripcion operativa del canal"
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

          <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label>Cargos adicionales</Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Agrega impuestos, comisiones o recargos porcentuales.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => subTaxes.append({ name: "", percentage: 0 })}
              >
                <Plus data-icon="inline-start" />
                Agregar
              </Button>
            </div>

            {subTaxes.fields.length > 0 ? (
              <div className="space-y-3">
                {subTaxes.fields.map((field, index) => {
                  const nameError =
                    form.formState.errors.subTaxes?.[index]?.name;
                  const percentageError =
                    form.formState.errors.subTaxes?.[index]?.percentage;

                  return (
                    <div
                      key={field.id}
                      className="grid gap-3 rounded-md border border-border/70 p-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto]"
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`sales-channel-subtax-name-${index}`}>
                          Nombre
                        </Label>
                        <Input
                          id={`sales-channel-subtax-name-${index}`}
                          placeholder="Ej. IVA"
                          disabled={isPending}
                          aria-invalid={Boolean(nameError)}
                          {...form.register(`subTaxes.${index}.name`)}
                        />
                        {nameError ? (
                          <p className="text-sm text-destructive">
                            {nameError.message}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor={`sales-channel-subtax-percentage-${index}`}
                        >
                          Porcentaje
                        </Label>
                        <Input
                          id={`sales-channel-subtax-percentage-${index}`}
                          type="number"
                          min={0}
                          max={100}
                          step="0.01"
                          disabled={isPending}
                          aria-invalid={Boolean(percentageError)}
                          {...form.register(`subTaxes.${index}.percentage`)}
                        />
                        {percentageError ? (
                          <p className="text-sm text-destructive">
                            {percentageError.message}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          aria-label="Eliminar impuesto"
                          onClick={() => subTaxes.remove(index)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                El precio base se usará sin cargos adicionales.
              </p>
            )}
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
              {isPending ? "Guardando..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
