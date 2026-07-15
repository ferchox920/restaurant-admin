"use client";

import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/feedback/page-skeleton";

const SaleTicketPage = dynamic(
  () =>
    import("@/features/sales/components/sale-ticket-page").then(
      (module) => module.SaleTicketPage
    ),
  { loading: () => <PageSkeleton /> }
);

export function SaleTicketRoute({ ticketId }: { ticketId: string }) {
  return <SaleTicketPage ticketId={ticketId} />;
}
