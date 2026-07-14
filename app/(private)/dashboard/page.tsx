"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getNavigationForRole } from "@/lib/permissions/navigation";

const modulePriorities = [
  {
    href: "/sales",
    label: "Tomar una venta",
    description: "Crea tickets, agrega items y confirma operaciones de caja.",
    eyebrow: "Caja",
  },
  {
    href: "/inventory",
    label: "Revisar stock",
    description: "Controla existencias y registra ajustes operativos.",
    eyebrow: "Stock",
  },
  {
    href: "/products",
    label: "Actualizar catalogo",
    description: "Administra productos, costos, precios e inventario asociado.",
    eyebrow: "Catalogo",
  },
  {
    href: "/reports",
    label: "Leer reportes",
    description: "Consulta ventas, stock y movimientos con filtros reales.",
    eyebrow: "Analisis",
  },
  {
    href: "/audit-logs",
    label: "Auditar cambios",
    description: "Revisa eventos sensibles y trazabilidad del sistema.",
    eyebrow: "Control",
  },
  {
    href: "/users",
    label: "Gestionar equipo",
    description: "Administra usuarios internos, roles y estados.",
    eyebrow: "Equipo",
  },
  {
    href: "/sales-channels",
    label: "Configurar canales",
    description: "Mantiene activos los canales donde se registran ventas.",
    eyebrow: "Canales",
  },
  {
    href: "/payment-banks",
    label: "Configurar bancos",
    description: "Define bancos disponibles para pagos por transferencia.",
    eyebrow: "Pagos",
  },
  {
    href: "/categories",
    label: "Ordenar categorias",
    description: "Organiza el catalogo para mejorar carga y consulta.",
    eyebrow: "Catalogo",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const navigation = getNavigationForRole(user.role).filter(
    (item) => item.href !== "/dashboard"
  );
  const accessibleHrefs = new Set(navigation.map((item) => item.href));
  const priorityActions = modulePriorities.filter((item) =>
    accessibleHrefs.has(item.href)
  );
  const priorityHrefs = new Set(priorityActions.map((item) => item.href));
  const orderedNavigation = [
    ...priorityActions.flatMap((priority) =>
      navigation.find((item) => item.href === priority.href) ?? []
    ),
    ...navigation.filter((item) => !priorityHrefs.has(item.href)),
  ];
  const primaryModules = orderedNavigation.slice(0, 3);
  const secondaryModules = orderedNavigation.slice(3);
  const mainAction = priorityActions[0] ?? primaryModules[0];
  const quickActions = priorityActions.slice(0, 3);
  const nextActions = orderedNavigation.slice(3, 6);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)]">
        <div className="overflow-hidden rounded-xl bg-[linear-gradient(135deg,var(--card)_0%,color-mix(in_oklch,var(--muted),var(--background)_45%)_100%)] p-5 ring-1 ring-foreground/10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-sm font-medium text-muted-foreground ring-1 ring-foreground/10">
                <Clock3 aria-hidden="true" className="size-4" />
                Centro operativo
              </p>
              <div className="space-y-2">
                <h1 className="font-heading text-3xl leading-tight font-medium">
                  Hola, {user.firstName}. Que necesitas resolver ahora?
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Empieza por una accion concreta segun tu perfil. El resto de
                  los modulos queda disponible abajo como mapa operativo.
                </p>
              </div>
            </div>
            {mainAction ? (
              <Button
                render={<Link href={mainAction.href} />}
                nativeButton={false}
                className="w-full md:w-auto"
              >
                Ir a {mainAction.label}
                <ArrowRight aria-hidden="true" data-icon="inline-end" />
              </Button>
            ) : null}
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {quickActions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-lg bg-background/80 p-4 ring-1 ring-foreground/10 transition-colors hover:bg-background"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.eyebrow}
                </p>
                <p className="mt-2 font-medium group-hover:underline">
                  {item.label}
                </p>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
        <Card className="overflow-hidden border-muted/70 bg-gradient-to-br from-background via-background to-muted/40 shadow-sm">
          <CardHeader className="gap-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles aria-hidden="true" className="size-5" />
              Siguiente foco
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Accesos utiles despues de la accion principal.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {(nextActions.length > 0 ? nextActions : orderedNavigation.slice(0, 3)).map(
              (item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center justify-between gap-3 rounded-xl border bg-background/80 p-3 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                        <Icon aria-hidden="true" className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block line-clamp-1 text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                );
              }
            )}
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Operaciones disponibles</h2>
            <p className="text-sm text-muted-foreground">
              Modulos habilitados para tu cuenta.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {navigation.length} accesos
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {primaryModules.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.href} size="sm" className="bg-card">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <CardTitle>{item.label}</CardTitle>
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    render={<Link href={item.href} />}
                    nativeButton={false}
                    variant="outline"
                    className="w-full justify-between"
                  >
                    Abrir
                    <ArrowRight aria-hidden="true" data-icon="inline-end" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      {secondaryModules.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Mas accesos</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {secondaryModules.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-lg bg-card px-4 py-3 text-sm ring-1 ring-foreground/10 transition-colors hover:bg-muted/60"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="truncate font-medium">{item.label}</span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
