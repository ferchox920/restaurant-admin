import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/common/status-badge";
import { formatDateTime } from "@/lib/formatters";
import { SalesChannelActions } from "@/features/sales-channels/components/sales-channel-actions";
import type { SalesChannel } from "@/features/sales-channels/types/sales-channel.types";

type SalesChannelTableProps = {
  salesChannels: SalesChannel[];
  canMutate: boolean;
  onEdit: (salesChannel: SalesChannel) => void;
  onDeactivate: (salesChannel: SalesChannel) => Promise<void> | void;
  onReactivate: (salesChannel: SalesChannel) => Promise<void> | void;
  pendingSalesChannelId?: string | null;
  pendingAction?: "deactivate" | "reactivate" | null;
};

function getTotalChargesPercentage(salesChannel: SalesChannel) {
  return (salesChannel.subTaxes ?? []).reduce(
    (total, subTax) => total + subTax.percentage,
    0
  );
}

export function SalesChannelTable({
  salesChannels,
  canMutate,
  onEdit,
  onDeactivate,
  onReactivate,
  pendingSalesChannelId,
  pendingAction,
}: SalesChannelTableProps) {
  return (
    <Table className="min-w-[760px]">
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Impuestos y comisiones</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="hidden xl:table-cell">Actualizado</TableHead>
          {canMutate ? (
            <TableHead className="text-right">Acciones</TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {salesChannels.map((salesChannel) => (
          <TableRow
            key={salesChannel.id}
            className={
              !salesChannel.active ? "bg-muted/30 text-muted-foreground" : ""
            }
          >
            <TableCell className="max-w-56 whitespace-normal">
              <p className="font-medium text-foreground">{salesChannel.name}</p>
              {salesChannel.description ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {salesChannel.description}
                </p>
              ) : null}
            </TableCell>
            <TableCell>
              <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs font-medium text-foreground">
                {salesChannel.code}
              </span>
            </TableCell>
            <TableCell className="max-w-80 whitespace-normal">
              {(salesChannel.subTaxes ?? []).length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    {(salesChannel.subTaxes ?? []).length}{" "}
                    {(salesChannel.subTaxes ?? []).length === 1
                      ? "cargo"
                      : "cargos"}{" "}
                    · {getTotalChargesPercentage(salesChannel)}% total
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(salesChannel.subTaxes ?? []).map((subTax) => (
                      <span
                        key={subTax.id}
                        className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {subTax.name}: {subTax.percentage}%
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Sin cargos adicionales
                </span>
              )}
            </TableCell>
            <TableCell>
              <StatusBadge
                status={salesChannel.active ? "active" : "inactive"}
              />
            </TableCell>
            <TableCell className="hidden xl:table-cell">
              {formatDateTime(salesChannel.updatedAt)}
            </TableCell>
            {canMutate ? (
              <TableCell>
                <SalesChannelActions
                  salesChannel={salesChannel}
                  canMutate={canMutate}
                  onEdit={onEdit}
                  onDeactivate={onDeactivate}
                  onReactivate={onReactivate}
                  isDeactivatePending={
                    pendingSalesChannelId === salesChannel.id &&
                    pendingAction === "deactivate"
                  }
                  isReactivatePending={
                    pendingSalesChannelId === salesChannel.id &&
                    pendingAction === "reactivate"
                  }
                />
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
