import { LoaderCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LoadingStateProps = {
  title: string;
  message: string;
  className?: string;
};

export function LoadingState({ title, message, className }: LoadingStateProps) {
  return (
    <Card
      role="status"
      aria-live="polite"
      className={className ?? "w-full max-w-md shadow-sm"}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  );
}
