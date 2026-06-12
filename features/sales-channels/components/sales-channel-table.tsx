import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/common/status-badge";
import { formatCommissionType, formatDateTime } from "@/lib/formatters";
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Codigo</TableHead>
          <TableHead>Comision</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Actualizado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
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
            <TableCell className="font-medium text-foreground">
              {salesChannel.name}
            </TableCell>
            <TableCell>{salesChannel.code}</TableCell>
            <TableCell>
              {formatCommissionType(salesChannel.commissionType)}:{" "}
              {salesChannel.commissionValue}
            </TableCell>
            <TableCell>
              <StatusBadge
                status={salesChannel.active ? "active" : "inactive"}
              />
            </TableCell>
            <TableCell>{formatDateTime(salesChannel.updatedAt)}</TableCell>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
