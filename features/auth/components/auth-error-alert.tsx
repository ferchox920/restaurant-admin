import { ErrorMessage } from "@/components/feedback/error-message";

type AuthErrorAlertProps = {
  message: string | string[];
};

export function AuthErrorAlert({ message }: AuthErrorAlertProps) {
  return <ErrorMessage messages={message} />;
}
