"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getNavigationForRole } from "@/lib/permissions/navigation";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const navigation = getNavigationForRole(user.role).filter(
    (item) => item.href !== "/dashboard"
  );

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,1fr)]">
        <Card className="border-none bg-[linear-gradient(135deg,color-mix(in_oklch,var(--card),var(--sidebar-primary)_9%)_0%,var(--card)_100%)] shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl">Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Hola, {user.firstName}. Este es tu punto de entrada al panel
              administrativo de Sprint 3.
            </p>
            <p>
              Tu rol actual es <span className="font-medium text-foreground">{user.role}</span> y
              la navegacion ya esta filtrada segun los modulos que puedes ver en
              esta etapa.
            </p>
            <p>
              Los modulos siguen en construccion. Este dashboard no consume API,
              no muestra metricas reales y solo organiza accesos rapidos dentro
              del shell privado.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Estado de la sesion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Usuario</p>
              <p className="font-medium">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Rol</p>
              <p className="font-medium">{user.role}</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-3 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-foreground" />
              La sesion se recupera con auth real y mantiene el manejo visual de
              `401` y `403`.
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3">
        <div>
          <h2 className="text-2xl font-semibold">Accesos segun tu rol</h2>
          <p className="text-sm text-muted-foreground">
            Los siguientes modulos coinciden con la navegacion permitida para tu
            rol en Sprint 3.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.href} size="sm" className="bg-card/90">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <CardTitle>{item.label}</CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.sprint ?? "Sprint futuro"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    {item.description ??
                      "Modulo placeholder disponible para tu rol actual."}
                  </p>
                  <Button
                    render={<Link href={item.href} />}
                    variant="outline"
                    className="w-full justify-between"
                  >
                    Abrir modulo
                    <ArrowRight data-icon="inline-end" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
