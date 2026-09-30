import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TableOrder } from "@/features/table-orders/types/table-order.types";
import { formatMoney } from "@/lib/money";

export function TableOrderTotalCard({ order }: { order: TableOrder }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Total</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">
            {formatMoney(order.saleTicket.subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between text-lg">
          <span className="font-medium">Total</span>
          <span className="font-semibold">
            {formatMoney(order.saleTicket.total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
