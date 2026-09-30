"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorMessage } from "@/components/feedback/error-message";
import {
  SalesChannelSelector,
  type SelectableSalesChannel,
} from "@/features/sales/components/sales-channel-selector";
import { createSaleTicketSchema } from "@/features/sales/schemas/sale-ticket.schema";
import type { CreateSaleTicketFormValues } from "@/features/sales/types/sale-ticket.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type CreateSaleTicketFormProps = {
  channels: SelectableSalesChannel[];
  isPending?: boolean;
  error?: unknown;
  onSubmit: (values: CreateSaleTicketFormValues) => Promise<void> | void;
};

export function CreateSaleTicketForm({
  channels,
  isPending = false,
  error,
  onSubmit,
}: CreateSaleTicketFormProps) {
  const form = useForm<CreateSaleTicketFormValues>({
    resolver: zodResolver(createSaleTicketSchema),
    defaultValues: {
      salesChannelId: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (channels.length === 1 && !form.getValues("salesChannelId")) {
      form.setValue("salesChannelId", channels[0].id, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [channels, form]);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label>Canal de venta</Label>
        <Controller
          control={form.control}
          name="salesChannelId"
          render={({ field }) => (
            <SalesChannelSelector
              channels={channels}
              selectedChannelId={field.value}
              onChange={(value) => field.onChange(value ?? "")}
            />
          )}
        />
        {form.formState.errors.salesChannelId ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.salesChannelId.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sale-ticket-notes">Notas</Label>
        <Textarea
          id="sale-ticket-notes"
          placeholder="Comentarios operativos opcionales"
          aria-invalid={Boolean(form.formState.errors.notes)}
          {...form.register("notes")}
        />
        {form.formState.errors.notes ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.notes.message}
          </p>
        ) : null}
      </div>

      {error ? (
        <ErrorMessage
          title="No se pudo crear la venta"
          messages={getApiErrorMessages(error)}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={isPending || channels.length === 0}>
          {isPending ? "Creando..." : "Crear borrador"}
        </Button>
        <Input
          type="hidden"
          value={String(channels.length)}
          readOnly
          aria-hidden="true"
        />
      </div>
    </form>
  );
}
