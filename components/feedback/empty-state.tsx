import { Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  message: string;
  className?: string;
};

export function EmptyState({ title, message, className }: EmptyStateProps) {
  return (
    <Card className={className ?? "w-full max-w-md shadow-sm"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Inbox className="size-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  );
}
