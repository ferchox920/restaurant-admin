"use client";

import { Button } from "@/components/ui/button";

type PaginationControlsProps = {
  offset: number;
  limit: number;
  itemCount: number;
  onOffsetChange: (offset: number) => void;
  disabled?: boolean;
};

export function PaginationControls({
  offset,
  limit,
  itemCount,
  onOffsetChange,
  disabled,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-t pt-4">
      <span className="text-sm text-muted-foreground">
        Pagina {Math.floor(offset / limit) + 1}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || offset === 0}
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
        >
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || itemCount !== limit}
          onClick={() => onOffsetChange(offset + itemCount)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
