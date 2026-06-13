import { Button } from "@/components/ui/button";

type ReportPaginationProps = {
  count: number;
  limit: number;
  offset: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
};

export function ReportPagination({
  count,
  limit,
  offset,
  total,
  onPrevious,
  onNext,
}: ReportPaginationProps) {
  const page = Math.floor(offset / Math.max(limit, 1)) + 1;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const canGoBack = offset > 0;
  const canGoNext = offset + limit < total;

  return (
    <nav aria-label="Paginacion de movimientos" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          Mostrando {count} movimientos de {total}.
        </p>
        <p>
          Pagina {page} de {totalPages} · Offset {offset} · Limite {limit}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!canGoBack}
          onClick={onPrevious}
        >
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!canGoNext}
          onClick={onNext}
        >
          Siguiente
        </Button>
      </div>
    </nav>
  );
}
