import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const scopeNotices = [
  "Ventas cerradas",
  "Informacion de solo lectura",
  "Filtros por periodo y entidad",
] as const;

export function ReportScopeNotice() {
  return (
    <Card className="bg-[linear-gradient(135deg,color-mix(in_oklch,var(--card),var(--sidebar-primary)_7%)_0%,var(--card)_100%)]">
      <CardHeader>
        <CardTitle>Alcance</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {scopeNotices.map((notice) => (
          <Badge
            key={notice}
            variant="outline"
            className="h-auto whitespace-normal border-border px-3 py-1 text-left leading-5"
          >
            {notice}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );
}
