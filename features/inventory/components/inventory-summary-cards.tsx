import { AlertTriangle, CircleCheck, CircleX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { InventoryStockItem } from "@/features/inventory/types/inventory.types";

export function InventorySummaryCards({
  items,
}: {
  items: InventoryStockItem[];
}) {
  const available = items.filter(
    (item) => item.stockStatus === "AVAILABLE"
  ).length;
  const lowStock = items.filter(
    (item) => item.stockStatus === "LOW_STOCK"
  ).length;
  const outOfStock = items.filter(
    (item) => item.stockStatus === "OUT_OF_STOCK"
  ).length;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <SummaryCard
        title="Disponibles"
        value={String(available)}
        tone="available"
      />
      <SummaryCard title="Bajo stock" value={String(lowStock)} tone="low" />
      <SummaryCard title="Agotados" value={String(outOfStock)} tone="empty" />
    </div>
  );
}

function SummaryCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone: "available" | "low" | "empty";
}) {
  const icon =
    tone === "available" ? (
      <CircleCheck aria-hidden="true" className="size-5" />
    ) : tone === "low" ? (
      <AlertTriangle aria-hidden="true" className="size-5" />
    ) : (
      <CircleX aria-hidden="true" className="size-5" />
    );
  const toneClass =
    tone === "available"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : tone === "low"
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        : "bg-rose-500/10 text-rose-600 dark:text-rose-400";

  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <span className={`rounded-lg p-2 ${toneClass}`}>{icon}</span>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
