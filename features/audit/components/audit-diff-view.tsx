import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sanitizeAuditData } from "@/features/audit/utils/sanitize-audit-data";

type DiffRow = {
  key: string;
  change: "added" | "removed" | "changed";
  beforeValue?: unknown;
  afterValue?: unknown;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatSimpleValue(value: unknown) {
  if (value === null) {
    return "null";
  }

  if (value === undefined) {
    return "-";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "[Dato malformado]";
  }
}

function buildDiff(
  beforeValue: unknown,
  afterValue: unknown
): DiffRow[] | null {
  const sanitizedBefore = sanitizeAuditData(beforeValue);
  const sanitizedAfter = sanitizeAuditData(afterValue);

  if (!isPlainObject(sanitizedBefore) || !isPlainObject(sanitizedAfter)) {
    return null;
  }

  const keys = new Set([
    ...Object.keys(sanitizedBefore),
    ...Object.keys(sanitizedAfter),
  ]);

  const rows: DiffRow[] = [];

  keys.forEach((key) => {
    const hasBefore = Object.prototype.hasOwnProperty.call(
      sanitizedBefore,
      key
    );
    const hasAfter = Object.prototype.hasOwnProperty.call(sanitizedAfter, key);
    const beforeEntry = sanitizedBefore[key];
    const afterEntry = sanitizedAfter[key];

    if (hasBefore && !hasAfter) {
      rows.push({
        key,
        change: "removed",
        beforeValue: beforeEntry,
      });
      return;
    }

    if (!hasBefore && hasAfter) {
      rows.push({
        key,
        change: "added",
        afterValue: afterEntry,
      });
      return;
    }

    if (JSON.stringify(beforeEntry) !== JSON.stringify(afterEntry)) {
      rows.push({
        key,
        change: "changed",
        beforeValue: beforeEntry,
        afterValue: afterEntry,
      });
    }
  });

  return rows;
}

const diffBadgeTone: Record<DiffRow["change"], string> = {
  added:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  removed:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  changed:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
};

const diffLabel: Record<DiffRow["change"], string> = {
  added: "Agregada",
  removed: "Eliminada",
  changed: "Modificada",
};

type AuditDiffViewProps = {
  beforeValue: unknown;
  afterValue: unknown;
};

export function AuditDiffView({ beforeValue, afterValue }: AuditDiffViewProps) {
  const rows = buildDiff(beforeValue, afterValue);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambios representacionales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Vista derivada en frontend sobre datos ya sanitizados. No proviene del
          backend.
        </p>

        {!rows ? (
          <p className="text-muted-foreground">
            No se puede calcular un diff visual para este formato de datos.
          </p>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground">
            No se detectaron cambios representables entre el estado anterior y
            posterior.
          </p>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={row.key}
                className="rounded-lg border border-border bg-muted/30 px-3 py-3"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={diffBadgeTone[row.change]}
                  >
                    {diffLabel[row.change]}
                  </Badge>
                  <span className="font-medium">{row.key}</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Estado anterior
                    </p>
                    <p>{formatSimpleValue(row.beforeValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Estado posterior
                    </p>
                    <p>{formatSimpleValue(row.afterValue)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
