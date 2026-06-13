"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorMessage } from "@/components/feedback/error-message";
import {
  commissionTypes,
  type CommissionType,
  type CreateSalesChannelInput,
} from "@/features/sales-channels/types/sales-channel.types";
import { salesChannelSchema } from "@/features/sales-channels/schemas/sales-channel.schema";
import { formatCommissionType } from "@/lib/formatters";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";

const salesChannelFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  code: z.string().trim().min(1, "El codigo es obligatorio."),
  description: z.string().trim().optional(),
  commissionType: z.enum(commissionTypes, {
    message: "Selecciona un tipo de comision valido.",
  }),
  commissionValue: z.coerce.number({
    error: "La comision debe ser un numero valido.",
  }),
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
      commissionType: initialValues?.commissionType ?? "NONE",
      commissionValue: initialValues?.commissionValue ?? 0,
    },
  });

  const commissionType = useWatch({
    control: form.control,
    name: "commissionType",
  });

  useEffect(() => {
    const nextValues = {
      name: initialValues?.name ?? "",
      code: initialValues?.code ?? "",
      description: initialValues?.description ?? "",
      commissionType: initialValues?.commissionType ?? "NONE",
      commissionValue: initialValues?.commissionValue ?? 0,
    };

    form.reset(nextValues);
  }, [form, initialValues, open]);

  useEffect(() => {
    if (commissionType === "NONE") {
      form.setValue("commissionValue", 0, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [commissionType, form]);

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
      <DialogContent className="sm:max-w-lg" showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
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
            <Label htmlFor="sales-channel-code">Codigo</Label>
            <Input
              id="sales-channel-code"
              placeholder="PEDIDOSYA"
              disabled={isPending}
              aria-invalid={Boolean(form.formState.errors.code)}
              {...form.register("code")}
            />
            {form.formState.errors.code ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.code.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sales-channel-description">Descripcion</Label>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de comision</Label>
              <Controller
                control={form.control}
                name="commissionType"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as CommissionType)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un tipo">
                        {(value) =>
                          value
                            ? formatCommissionType(value as CommissionType)
                            : "Selecciona un tipo"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {commissionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {formatCommissionType(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.commissionType ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.commissionType.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sales-channel-commission-value">
                Valor de comision
              </Label>
              <Input
                id="sales-channel-commission-value"
                type="number"
                min={commissionType === "PERCENTAGE" ? -100 : 0}
                max={commissionType === "PERCENTAGE" ? 100 : undefined}
                step="0.01"
                disabled={isPending || commissionType === "NONE"}
                aria-invalid={Boolean(form.formState.errors.commissionValue)}
                {...form.register("commissionValue")}
              />
              {form.formState.errors.commissionValue ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.commissionValue.message}
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
              {isPending ? "Guardando..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
