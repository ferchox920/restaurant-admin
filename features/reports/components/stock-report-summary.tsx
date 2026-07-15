import type {
  StockReportItem,
  StockReportSummary as StockSummary,
} from "@/features/reports/types/report.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MetricCardProps = {
  title: string;
  value: number;
  description: string;
};

function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-medium text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function StockReportSummary({
  items,
  summary,
}: {
  items: StockReportItem[];
  summary?: StockSummary;
}) {
  const outOfStock =
    summary?.outOfStock ??
    items.filter((item) => item.stockStatus === "OUT_OF_STOCK").length;
  const lowStock =
    summary?.lowStock ??
    items.filter((item) => item.stockStatus === "LOW_STOCK").length;
  const available =
    summary?.available ??
    items.filter((item) => item.stockStatus === "AVAILABLE").length;
  const notTracked =
    summary?.notTracked ??
    items.filter((item) => item.stockStatus === "NOT_TRACKED").length;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Agotados"
          value={outOfStock}
          description="Productos visibles con stock agotado."
        />
        <MetricCard
          title="Bajo minimo"
          value={lowStock}
          description="Productos visibles con stock en o bajo minimo."
        />
        <MetricCard
          title="Disponibles"
          value={available}
          description="Productos visibles con stock operativo."
        />
        <MetricCard
          title="No controlados"
          value={notTracked}
          description="Productos visibles sin control de stock operativo."
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {summary
          ? "El resumen corresponde a todo el conjunto filtrado."
          : "El resumen corresponde solo al conjunto visible actual."}
      </p>
    </div>
  );
}
