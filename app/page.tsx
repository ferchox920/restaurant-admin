import Link from "next/link";
import { ArrowRight, LayoutDashboard, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { appName } from "@/lib/env";

export default function Home() {
  return (
    <main className="min-h-screen bg-muted/30 px-6 py-16">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Card>
          <CardHeader>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
              {appName}
            </h1>
            <CardDescription>
              Panel administrativo del MVP con catalogo, inventario, ventas,
              reportes, usuarios y auditoria listos para demo operativa.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Card className="bg-background">
              <CardHeader>
                <CardTitle className="text-lg">Estado actual</CardTitle>
                <CardDescription>
                  Front Sprint 10 cierra el MVP con UX homogenea, validaciones,
                  estados de feedback consistentes y readiness de despliegue.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-background">
              <CardHeader>
                <CardTitle className="text-lg">Flujo de demo</CardTitle>
                <CardDescription>
                  Usa `/login` para autenticarte y continua en `/dashboard` para
                  recorrer modulos segun rol sin depender de Swagger.
                </CardDescription>
              </CardHeader>
            </Card>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-end">
            <Button
              render={<Link href="/login" />}
              nativeButton={false}
              className="w-full sm:w-auto"
            >
              <LogIn aria-hidden="true" data-icon="inline-start" />
              Ir a login
            </Button>
            <Button
              render={<Link href="/dashboard" />}
              nativeButton={false}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <LayoutDashboard aria-hidden="true" data-icon="inline-start" />
              Ver dashboard
              <ArrowRight aria-hidden="true" data-icon="inline-end" />
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
