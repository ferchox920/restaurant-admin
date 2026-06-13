import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  SalesByChannelReportItem,
  SalesByProductReportItem,
  SalesByUserReportItem,
} from "@/features/reports/types/report.types";
import { formatMoney } from "@/lib/money";

type SalesSummaryItem =
  | SalesByChannelReportItem
  | SalesByProductReportItem
  | SalesByUserReportItem;

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
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

export function SalesSummaryCards({ items }: { items: SalesSummaryItem[] }) {
  // These totals are presentation-only summaries over the visible response.
  const totals = items.reduce(
    (accumulator, item) => {
      accumulator.tickets += item.ticketsCount;
      accumulator.units += Number(item.quantitySold);
      accumulator.grossSales += Number(item.grossSales);
      accumulator.grossProfit += Number(item.grossProfit);
      return accumulator;
    },
    {
      tickets: 0,
      units: 0,
      grossSales: 0,
      grossProfit: 0,
    }
  );

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Tickets visibles"
          value={String(totals.tickets)}
          description="Total de tickets agregados en la respuesta actual."
        />
        <MetricCard
          title="Unidades visibles"
          value={new Intl.NumberFormat("es-AR", {
            maximumFractionDigits: 2,
          }).format(totals.units)}
          description="Cantidad agregada visible segun el rango y filtros actuales."
        />
        <MetricCard
          title="Ventas visibles"
          value={formatMoney(String(totals.grossSales))}
          description="Ventas brutas del conjunto visible."
        />
        <MetricCard
          title="Margen visible"
          value={formatMoney(String(totals.grossProfit))}
          description="Margen bruto del conjunto visible."
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Los totales resumen solo la respuesta visible actual y no recalculan metricas contables ni datos historicos.
      </p>
    </div>
  );
}
