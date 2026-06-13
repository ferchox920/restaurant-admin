import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ForbiddenStateProps = {
  title?: string;
  message?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function ForbiddenState({
  title = "Acceso denegado",
  message = "No tienes permisos para realizar esta accion.",
  actionHref = "/dashboard",
  actionLabel = "Volver al dashboard",
}: ForbiddenStateProps) {
  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <ShieldAlert className="size-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ErrorMessage
          variant="forbidden"
          title="Acceso restringido"
          messages={message}
        />
      </CardContent>
      <CardFooter>
        <Button
          render={<Link href={actionHref} />}
          nativeButton={false}
          className="w-full"
        >
          {actionLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
