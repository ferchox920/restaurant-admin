import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sanitizeAuditData } from "@/features/audit/utils/sanitize-audit-data";

type AuditDataViewerProps = {
  title: string;
  value: unknown;
  emptyMessage: string;
};

function isPlainObject(value: unknown) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEmptyObject(value: unknown) {
  return (
    isPlainObject(value) &&
    Object.keys(value as Record<string, unknown>).length === 0
  );
}

function renderValue(value: unknown) {
  if (value === null) {
    return <span className="text-muted-foreground">null</span>;
  }

  if (typeof value === "string") {
    return <span className="break-words">{value}</span>;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return <span>{String(value)}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground">[]</span>;
    }

    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-muted/30 px-3 py-2"
          >
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Item {index + 1}
            </p>
            <div className="text-sm">{renderValue(item)}</div>
          </div>
        ))}
      </div>
    );
  }

  if (isEmptyObject(value)) {
    return <span className="text-muted-foreground">Objeto vacio</span>;
  }

  if (isPlainObject(value)) {
    return (
      <div className="space-y-2">
        {Object.entries(value as Record<string, unknown>).map(
          ([key, nestedValue]) => (
            <div
              key={key}
              className="rounded-lg border border-border bg-muted/30 px-3 py-2"
            >
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                {key}
              </p>
              <div className="text-sm">{renderValue(nestedValue)}</div>
            </div>
          )
        )}
      </div>
    );
  }

  return <span className="text-muted-foreground">Dato malformado</span>;
}

export function AuditDataViewer({
  title,
  value,
  emptyMessage,
}: AuditDataViewerProps) {
  const sanitized = sanitizeAuditData(value);
  const isEmpty =
    sanitized === undefined ||
    sanitized === null ||
    isEmptyObject(sanitized) ||
    (Array.isArray(sanitized) && sanitized.length === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0 text-sm">
        {isEmpty ? (
          <p className="text-muted-foreground">{emptyMessage}</p>
        ) : (
          renderValue(sanitized)
        )}
      </CardContent>
    </Card>
  );
}
