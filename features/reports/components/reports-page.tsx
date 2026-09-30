"use client";

import {
  Boxes,
  ChartColumn,
  PackageSearch,
  ScanSearch,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ReportNavigationCard } from "@/features/reports/components/report-navigation-card";
import { ReportScopeNotice } from "@/features/reports/components/report-scope-notice";
import { reportRoutes } from "@/features/reports/constants/report-routes";

const reportCards = [
  {
    title: "Stock actual",
    description:
      "Consulta disponibilidad, niveles minimos y productos que requieren seguimiento.",
    href: reportRoutes.stock,
    icon: Boxes,
    summary: "Control diario de disponibilidad",
    details: ["Estado por producto", "Stock minimo", "Productos sin control"],
  },
  {
    title: "Ventas por canal",
    description:
      "Resume ventas confirmadas por canal con tickets, items, costo y ticket promedio.",
    href: reportRoutes.salesByChannel,
    icon: ChartColumn,
    summary: "Rendimiento comercial por origen",
    details: ["Tickets", "Items vendidos", "Ticket promedio"],
  },
  {
    title: "Ventas por producto",
    description:
      "Compara unidades vendidas, importes y costos por producto en el periodo seleccionado.",
    href: reportRoutes.salesByProduct,
    icon: PackageSearch,
    summary: "Lectura de productos con mayor impacto",
    details: ["Unidades", "Ventas", "Costos"],
  },
  {
    title: "Ventas por usuario confirmador",
    description:
      "Agrupa ventas cerradas por usuario para revisar volumen operativo y participacion.",
    href: reportRoutes.salesByUser,
    icon: Users,
    summary: "Seguimiento por responsable",
    details: ["Ventas confirmadas", "Importe total", "Tickets"],
  },
  {
    title: "Movimientos de inventario",
    description:
      "Revisa entradas, devoluciones, ajustes y desperdicios con filtros de busqueda.",
    href: reportRoutes.inventoryMovements,
    icon: ScanSearch,
    summary: "Trazabilidad de stock",
    details: ["Tipo de movimiento", "Producto", "Referencia"],
  },
] as const;

export function ReportsPage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Reportes"
        title="Reportes operativos"
        description="Consulta indicadores de stock, ventas y movimientos para controlar la operacion del restaurante."
      />

      <ReportScopeNotice />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportCards.map((card) => (
          <ReportNavigationCard key={card.href} {...card} />
        ))}
      </div>
    </section>
  );
}
