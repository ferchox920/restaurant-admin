"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

type SaleTicketActionsProps = {
  ticketId: string;
  readOnlyLabel?: string;
};

export function SaleTicketActions({
  ticketId,
  readOnlyLabel = "Ver detalle",
}: SaleTicketActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        render={<Link href={`/sales/${ticketId}`} />}
        nativeButton={false}
        type="button"
        variant="outline"
        size="sm"
      >
        <Eye aria-hidden="true" />
        {readOnlyLabel}
      </Button>
    </div>
  );
}
