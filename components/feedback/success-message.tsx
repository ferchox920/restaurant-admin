"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type SuccessMessageProps = {
  message: string;
  title?: string;
  timeoutMs?: number;
};

export function SuccessMessage({
  message,
  title = "Operacion completada",
  timeoutMs = 4500,
}: SuccessMessageProps) {
  const [hiddenMessage, setHiddenMessage] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setHiddenMessage(message);
    }, timeoutMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [message, timeoutMs]);

  if (hiddenMessage === message) {
    return null;
  }

  return (
    <Alert
      role="status"
      aria-live="polite"
      className="border-emerald-300/60 bg-emerald-50 text-emerald-950"
    >
      <CheckCircle2 aria-hidden="true" className="text-emerald-700" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="text-emerald-900">
        {message}
      </AlertDescription>
    </Alert>
  );
}
