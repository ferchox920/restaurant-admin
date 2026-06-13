import { SaleTicketPage } from "@/features/sales/components/sale-ticket-page";

type SaleTicketRoutePageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export default async function SaleTicketRoutePage({
  params,
}: SaleTicketRoutePageProps) {
  const { ticketId } = await params;

  return <SaleTicketPage ticketId={ticketId} />;
}
