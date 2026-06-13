import { SuccessMessage } from "@/components/feedback/success-message";

type InventoryOperationSuccessProps = {
  message: string;
};

export function InventoryOperationSuccess({
  message,
}: InventoryOperationSuccessProps) {
  return <SuccessMessage message={message} />;
}
