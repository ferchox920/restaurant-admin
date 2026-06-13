"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryOperationDialog } from "@/features/inventory/components/inventory-operation-dialog";
import { InventoryOperationSuccess } from "@/features/inventory/components/inventory-operation-success";
import { ManualAdjustmentForm } from "@/features/inventory/components/manual-adjustment-form";
import { MinimumStockForm } from "@/features/inventory/components/minimum-stock-form";
import { ReturnInForm } from "@/features/inventory/components/return-in-form";
import { StockInForm } from "@/features/inventory/components/stock-in-form";
import { WasteForm } from "@/features/inventory/components/waste-form";
import { useManualAdjustment } from "@/features/inventory/hooks/use-manual-adjustment";
import { useReturnIn } from "@/features/inventory/hooks/use-return-in";
import { useStockIn } from "@/features/inventory/hooks/use-stock-in";
import { useUpdateMinimumStock } from "@/features/inventory/hooks/use-update-minimum-stock";
import { useWaste } from "@/features/inventory/hooks/use-waste";
import type { StockManagementType } from "@/features/products/types/product.types";

type InventoryOperationActionsProps = {
  productId: string;
  currentStock: string;
  minimumStock: string;
  stockManagementType: StockManagementType;
  canMutate: boolean;
  isActive: boolean;
};

type OperationKey =
  | "stock-in"
  | "manual-adjustment"
  | "waste"
  | "return-in"
  | "minimum-stock"
  | null;

export function InventoryOperationActions({
  productId,
  currentStock,
  minimumStock,
  stockManagementType,
  canMutate,
  isActive,
}: InventoryOperationActionsProps) {
  const [openDialog, setOpenDialog] = useState<OperationKey>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const stockInMutation = useStockIn(productId);
  const manualAdjustmentMutation = useManualAdjustment(productId);
  const wasteMutation = useWaste(productId);
  const returnInMutation = useReturnIn(productId);
  const minimumStockMutation = useUpdateMinimumStock(productId);

  if (!canMutate) {
    return null;
  }

  if (stockManagementType !== "FINISHED_PRODUCT") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Operaciones manuales</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Este tipo de producto no admite operaciones manuales de inventario en el MVP.
        </CardContent>
      </Card>
    );
  }

  const movementButtonsDisabled = !isActive;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operaciones manuales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isActive ? (
          <p className="text-sm text-muted-foreground">
            El producto esta inactivo. El backend rechazara movimientos manuales,
            pero todavia puedes actualizar el stock minimo.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <InventoryOperationDialog
            open={openDialog === "stock-in"}
            onOpenChange={(open) => setOpenDialog(open ? "stock-in" : null)}
            isPending={stockInMutation.isPending}
            title="Ingresar stock"
            description="Ingresa una cantidad para sumarla al stock actual."
            trigger={
              <Button type="button" variant="outline" disabled={movementButtonsDisabled}>
                Ingresar stock
              </Button>
            }
          >
            <StockInForm
              isPending={stockInMutation.isPending}
              error={stockInMutation.error}
              successMessage={undefined}
              onSubmit={async (values) => {
                setSuccessMessage(null);
                await stockInMutation.mutateAsync(values);
                setSuccessMessage("El movimiento STOCK_IN se registro correctamente.");
                setOpenDialog(null);
              }}
            />
          </InventoryOperationDialog>

          <InventoryOperationDialog
            open={openDialog === "manual-adjustment"}
            onOpenChange={(open) =>
              setOpenDialog(open ? "manual-adjustment" : null)
            }
            isPending={manualAdjustmentMutation.isPending}
            title="Fijar stock actual"
            description="Define el nuevo valor absoluto del stock actual."
            trigger={
              <Button type="button" variant="outline" disabled={movementButtonsDisabled}>
                Fijar stock actual
              </Button>
            }
          >
            <ManualAdjustmentForm
              currentStock={currentStock}
              isPending={manualAdjustmentMutation.isPending}
              error={manualAdjustmentMutation.error}
              successMessage={undefined}
              onSubmit={async (values) => {
                setSuccessMessage(null);
                await manualAdjustmentMutation.mutateAsync(values);
                setSuccessMessage(
                  "El movimiento MANUAL_ADJUSTMENT se registro correctamente."
                );
                setOpenDialog(null);
              }}
            />
          </InventoryOperationDialog>

          <InventoryOperationDialog
            open={openDialog === "waste"}
            onOpenChange={(open) => setOpenDialog(open ? "waste" : null)}
            isPending={wasteMutation.isPending}
            title="Registrar merma"
            description="Descuenta stock por perdida, daño o descarte."
            trigger={
              <Button type="button" variant="outline" disabled={movementButtonsDisabled}>
                Registrar merma
              </Button>
            }
          >
            <WasteForm
              isPending={wasteMutation.isPending}
              error={wasteMutation.error}
              successMessage={undefined}
              onSubmit={async (values) => {
                setSuccessMessage(null);
                await wasteMutation.mutateAsync(values);
                setSuccessMessage("La merma se registro correctamente.");
                setOpenDialog(null);
              }}
            />
          </InventoryOperationDialog>

          <InventoryOperationDialog
            open={openDialog === "return-in"}
            onOpenChange={(open) => setOpenDialog(open ? "return-in" : null)}
            isPending={returnInMutation.isPending}
            title="Registrar reingreso"
            description="Suma nuevamente stock devuelto o reingresado al producto."
            trigger={
              <Button type="button" variant="outline" disabled={movementButtonsDisabled}>
                Registrar reingreso
              </Button>
            }
          >
            <ReturnInForm
              isPending={returnInMutation.isPending}
              error={returnInMutation.error}
              successMessage={undefined}
              onSubmit={async (values) => {
                setSuccessMessage(null);
                await returnInMutation.mutateAsync(values);
                setSuccessMessage("El reingreso se registro correctamente.");
                setOpenDialog(null);
              }}
            />
          </InventoryOperationDialog>

          <InventoryOperationDialog
            open={openDialog === "minimum-stock"}
            onOpenChange={(open) => setOpenDialog(open ? "minimum-stock" : null)}
            isPending={minimumStockMutation.isPending}
            title="Actualizar stock minimo"
            description="Configura el umbral minimo sin modificar el stock actual."
            trigger={
              <Button type="button" variant="outline">
                Actualizar stock minimo
              </Button>
            }
          >
            <MinimumStockForm
              currentMinimumStock={minimumStock}
              isPending={minimumStockMutation.isPending}
              error={minimumStockMutation.error}
              successMessage={undefined}
              onSubmit={async (values) => {
                setSuccessMessage(null);
                await minimumStockMutation.mutateAsync(values);
                setSuccessMessage("El stock minimo se actualizo correctamente.");
                setOpenDialog(null);
              }}
            />
          </InventoryOperationDialog>
        </div>
        {successMessage ? <InventoryOperationSuccess message={successMessage} /> : null}
      </CardContent>
    </Card>
  );
}
