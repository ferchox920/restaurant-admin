import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReportNavigationCardProps = {
  title: string;
  description: string;
  href: string;
  summary: string;
  details: readonly string[];
  icon: LucideIcon;
};

export function ReportNavigationCard({
  title,
  description,
  href,
  summary,
  details,
  icon: Icon,
}: ReportNavigationCardProps) {
  return (
    <Card className="transition-colors hover:bg-muted/30">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <Icon aria-hidden="true" className="size-4" />
          </span>
          <Badge variant="outline">Solo lectura</Badge>
        </div>
        <div className="space-y-2">
          <CardTitle>{title}</CardTitle>
          <p className="text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 px-3 py-3 text-sm">
          <p className="font-medium text-foreground">{summary}</p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Incluye</p>
          <ul className="space-y-1.5">
            {details.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 aria-hidden="true" className="size-4 text-foreground" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href={href}
          className="inline-flex h-8 w-full items-center justify-between rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Abrir reporte
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
