import { AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type ErrorMessageProps = {
  messages: string | string[];
  title?: string;
  variant?: "general" | "forbidden";
  className?: string;
};

export function ErrorMessage({
  messages,
  title,
  variant = "general",
  className,
}: ErrorMessageProps) {
  const normalizedMessages = Array.isArray(messages) ? messages : [messages];
  const Icon = variant === "forbidden" ? ShieldAlert : AlertTriangle;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        variant === "forbidden"
          ? "border-amber-300/60 bg-amber-50 text-amber-950"
          : "border-destructive/20 bg-destructive/10 text-destructive",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <div className="space-y-2">
          {title ? <p className="font-medium">{title}</p> : null}
          {normalizedMessages.length === 1 ? (
            <p>{normalizedMessages[0]}</p>
          ) : (
            <ul className="list-disc space-y-1 pl-4">
              {normalizedMessages.map((message, index) => (
                <li key={`${message}-${index}`}>{message}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
