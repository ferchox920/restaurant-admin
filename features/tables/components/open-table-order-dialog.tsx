"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { openTableOrderSchema } from "@/features/table-orders/schemas/table-order.schema";
import type { OpenTableOrderFormValues } from "@/features/table-orders/types/table-order.types";
import type { RestaurantTable } from "@/features/tables/types/table.types";
import type { SalesChannel } from "@/features/sales-channels/types/sales-channel.types";
import { getApiErrorMessages } from "@/lib/api/error-messages";

type Props = {
  table: RestaurantTable;
  channels: SalesChannel[];
  trigger: React.ReactElement;
  isPending?: boolean;
  error?: unknown;
  initialOpen?: boolean;
  onSubmit: (values: OpenTableOrderFormValues) => Promise<void> | void;
};

export function OpenTableOrderDialog({
  table,
  channels,
  trigger,
  isPending = false,
  error,
  initialOpen = false,
  onSubmit,
}: Props) {
  const submitting = useRef(false);
  const [open, setOpen] = useState(initialOpen);
  const defaultChannelId = useMemo(() => channels[0]?.id ?? "", [channels]);
  const form = useForm<OpenTableOrderFormValues>({
    resolver: zodResolver(openTableOrderSchema),
    defaultValues: {
      salesChannelId: defaultChannelId,
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ salesChannelId: defaultChannelId, notes: "" });
    }
  }, [defaultChannelId, form, open]);

  async function handleSubmit(values: OpenTableOrderFormValues) {
    if (submitting.current) return;
    submitting.current = true;
    try {
      await onSubmit(values);
      setOpen(false);
    } catch {
      return;
    } finally {
      submitting.current = false;
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending && !nextOpen) {
          return;
        }

        setOpen(nextOpen);
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>Abrir orden</DialogTitle>
          <DialogDescription>
            Mesa {table.code}. Los consumos descontarán stock cuando se cierre
            la orden.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            void form.handleSubmit(handleSubmit)(event);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor={`table-order-channel-${table.id}`}>
              Canal de venta
            </Label>
            <Controller
              control={form.control}
              name="salesChannelId"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id={`table-order-channel-${table.id}`}
                    className="w-full"
                    aria-invalid={Boolean(form.formState.errors.salesChannelId)}
                  >
                    <SelectValue placeholder="Selecciona un canal">
                      {(value) =>
                        channels.find((channel) => channel.id === value)
                          ?.name ?? "Selecciona un canal"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.name}
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

          {channels.length === 0 ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              No hay canales activos disponibles para abrir la orden.
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor={`table-order-notes-${table.id}`}>
              Notas <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id={`table-order-notes-${table.id}`}
              disabled={isPending}
              {...form.register("notes")}
            />
          </div>

          {error ? (
            <ErrorMessage
              title="No se pudo abrir la orden"
              messages={getApiErrorMessages(error)}
            />
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || channels.length === 0}>
              {isPending ? "Abriendo..." : "Abrir orden"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
