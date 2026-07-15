import { SaleTicketRoute } from "@/features/sales/components/sale-ticket-route";

type SaleTicketRoutePageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export default async function SaleTicketRoutePage({
  params,
}: SaleTicketRoutePageProps) {
  const { ticketId } = await params;

  return <SaleTicketRoute ticketId={ticketId} />;
}
