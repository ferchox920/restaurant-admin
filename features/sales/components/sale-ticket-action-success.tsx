import { SuccessMessage } from "@/components/feedback/success-message";

type SaleTicketActionSuccessProps = {
  message: string;
};

export function SaleTicketActionSuccess({
  message,
}: SaleTicketActionSuccessProps) {
  return <SuccessMessage message={message} />;
}
