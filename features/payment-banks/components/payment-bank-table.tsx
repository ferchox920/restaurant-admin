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
import { PaymentBankActions } from "@/features/payment-banks/components/payment-bank-actions";
import type { PaymentBank } from "@/features/payment-banks/types/payment-bank.types";

type PaymentBankTableProps = {
  paymentBanks: PaymentBank[];
  canMutate: boolean;
  onEdit: (paymentBank: PaymentBank) => void;
  onDeactivate: (paymentBank: PaymentBank) => Promise<void> | void;
  onReactivate: (paymentBank: PaymentBank) => Promise<void> | void;
  pendingPaymentBankId?: string | null;
  pendingAction?: "deactivate" | "reactivate" | null;
};

export function PaymentBankTable({
  paymentBanks,
  canMutate,
  onEdit,
  onDeactivate,
  onReactivate,
  pendingPaymentBankId,
  pendingAction,
}: PaymentBankTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Descripcion</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Actualizado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paymentBanks.map((paymentBank) => (
          <TableRow
            key={paymentBank.id}
            className={!paymentBank.active ? "bg-muted/30 text-muted-foreground" : ""}
          >
            <TableCell className="font-medium text-foreground">
              {paymentBank.name}
            </TableCell>
            <TableCell className="max-w-md whitespace-normal">
              {paymentBank.description || "Sin descripcion"}
            </TableCell>
            <TableCell>
              <StatusBadge status={paymentBank.active ? "active" : "inactive"} />
            </TableCell>
            <TableCell>{formatDateTime(paymentBank.updatedAt)}</TableCell>
            <TableCell>
              <PaymentBankActions
                paymentBank={paymentBank}
                canMutate={canMutate}
                onEdit={onEdit}
                onDeactivate={onDeactivate}
                onReactivate={onReactivate}
                isDeactivatePending={
                  pendingPaymentBankId === paymentBank.id &&
                  pendingAction === "deactivate"
                }
                isReactivatePending={
                  pendingPaymentBankId === paymentBank.id &&
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

