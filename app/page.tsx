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
            <CardTitle className="text-3xl">{appName}</CardTitle>
            <CardDescription>
              Base tecnica inicial del panel administrativo. En este sprint la
              aplicacion expone rutas placeholder, providers globales y una base
              reusable de componentes UI.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Card className="bg-background">
              <CardHeader>
                <CardTitle className="text-lg">Estado actual</CardTitle>
                <CardDescription>
                  Front Sprint 2 ya incorpora cliente API centralizado, login
                  real, recuperacion de sesion y proteccion de rutas privadas.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-background">
              <CardHeader>
                <CardTitle className="text-lg">Rutas iniciales</CardTitle>
                <CardDescription>
                  Usa `/login` para autenticarte y `/dashboard` para validar el
                  guard privado antes de seguir con los modulos del negocio.
                </CardDescription>
              </CardHeader>
            </Card>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-end">
            <Button
              render={<Link href="/login" />}
              className="w-full sm:w-auto"
            >
              <LogIn data-icon="inline-start" />
              Ir a login
            </Button>
            <Button
              render={<Link href="/dashboard" />}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <LayoutDashboard data-icon="inline-start" />
              Ver dashboard
              <ArrowRight data-icon="inline-end" />
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
