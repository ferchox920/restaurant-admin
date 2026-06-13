import { SuccessMessage } from "@/components/feedback/success-message";

type VersionCreatedMessageProps = {
  message: string;
};

export function VersionCreatedMessage({
  message,
}: VersionCreatedMessageProps) {
  return <SuccessMessage title="Version creada" message={message} />;
}
