"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/common/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ReportStockStatusBadge } from "@/features/reports/components/report-stock-status-badge";
import type { StockReportItem } from "@/features/reports/types/report.types";
import { formatDateTime } from "@/lib/formatters";
import { formatReportStockManagementType } from "@/features/reports/utils/report-formatters";
import { canAccessRoute } from "@/lib/permissions/can-access-route";

export function StockReportTable({ items }: { items: StockReportItem[] }) {
  const { user } = useAuth();
  const canOpenInventory = user ? canAccessRoute(user.role, "/inventory") : false;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Unidad</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Activo</TableHead>
          <TableHead>Stock actual</TableHead>
          <TableHead>Stock minimo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Actualizado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.productId}>
            <TableCell className="font-medium text-foreground">
              {canOpenInventory ? (
                <Link
                  href={`/inventory/${item.productId}`}
                  className="underline-offset-4 hover:underline"
                >
                  {item.productName}
                </Link>
              ) : (
                item.productName
              )}
            </TableCell>
            <TableCell>{item.productSku || "-"}</TableCell>
            <TableCell>{item.categoryName || "Sin categoria"}</TableCell>
            <TableCell>{item.unit}</TableCell>
            <TableCell>
              {formatReportStockManagementType(item.stockManagementType)}
            </TableCell>
            <TableCell>
              <StatusBadge status={item.active ? "active" : "inactive"} />
            </TableCell>
            <TableCell>{item.currentStock}</TableCell>
            <TableCell>{item.minimumStock}</TableCell>
            <TableCell>
              <ReportStockStatusBadge status={item.stockStatus} />
            </TableCell>
            <TableCell>{formatDateTime(item.updatedAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
