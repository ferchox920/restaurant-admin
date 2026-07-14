import { TableOrderDetailPage } from "@/features/table-orders/components/table-order-detail-page";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TableOrderDetailRoutePage({ params }: Props) {
  const { id } = await params;

  return <TableOrderDetailPage orderId={id} />;
}
