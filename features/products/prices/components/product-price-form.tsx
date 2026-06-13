"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
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
import { productPriceSchema } from "@/features/products/prices/schemas/product-price.schema";
import type { CreateProductPriceInput } from "@/features/products/prices/types/product-price.types";
import type { SalesChannel } from "@/features/sales-channels/types/sales-channel.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type ProductPriceFormValues = z.input<typeof productPriceSchema>;
type ProductPriceFormSubmitValues = z.output<typeof productPriceSchema>;

type ProductPriceFormProps = {
  channels: SalesChannel[];
  initialChannelId?: string;
  canSubmit: boolean;
  isPending?: boolean;
  error?: unknown;
  onSubmit: (values: CreateProductPriceInput) => Promise<void> | void;
};

export function ProductPriceForm({
  channels,
  initialChannelId,
  canSubmit,
  isPending = false,
  error,
  onSubmit,
}: ProductPriceFormProps) {
  const form = useForm<ProductPriceFormValues, undefined, ProductPriceFormSubmitValues>({
    resolver: zodResolver(productPriceSchema),
    defaultValues: {
      salesChannelId: initialChannelId ?? "",
      price: "",
    },
  });

  useEffect(() => {
    form.reset({
      salesChannelId: initialChannelId ?? "",
      price: "",
    });
  }, [form, initialChannelId]);

  async function handleSubmit(values: ProductPriceFormSubmitValues) {
    await onSubmit(values);
    form.reset({
      salesChannelId: values.salesChannelId,
      price: "",
    });
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Canal</Label>
          <Controller
            control={form.control}
            name="salesChannelId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" aria-invalid={Boolean(form.formState.errors.salesChannelId)}>
                  <SelectValue placeholder="Selecciona un canal">
                    {(value) => {
                      const channel = channels.find((item) => item.id === value);

                      return channel
                        ? `${channel.name}${!channel.active ? " (inactivo)" : ""}`
                        : "Selecciona un canal";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name}
                      {!channel.active ? " (inactivo)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.salesChannelId ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.salesChannelId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-price">Nuevo precio</Label>
          <Input
            id="product-price"
            inputMode="decimal"
            placeholder="Ej. 5999.99"
            disabled={!canSubmit || isPending}
            aria-invalid={Boolean(form.formState.errors.price)}
            {...form.register("price")}
          />
          {form.formState.errors.price ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.price.message}
            </p>
          ) : null}
        </div>
      </div>

      {error ? (
        <ErrorMessage
          title="No se pudo crear la nueva version"
          messages={getApiErrorMessages(error)}
        />
      ) : null}

      <Button type="submit" disabled={!canSubmit || isPending}>
        {isPending ? "Guardando..." : "Crear nueva version"}
      </Button>
    </form>
  );
}
