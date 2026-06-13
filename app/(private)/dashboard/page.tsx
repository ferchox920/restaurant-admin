"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  KeyRound,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getNavigationForRole } from "@/lib/permissions/navigation";
import type { UserRole } from "@/types/roles";

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  MANAGER: "Gerencia",
  CASHIER: "Caja",
  AUDITOR: "Auditoria",
};

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const navigation = getNavigationForRole(user.role).filter(
    (item) => item.href !== "/dashboard"
  );
  const primaryModules = navigation.slice(0, 3);
  const secondaryModules = navigation.slice(3);
  const roleLabel = roleLabels[user.role] ?? user.role;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)]">
        <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Panel administrativo
              </p>
              <div className="space-y-2">
                <h1 className="font-heading text-3xl leading-tight font-medium">
                  Hola, {user.firstName}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Accede a las operaciones habilitadas para tu perfil y continua
                  la gestion diaria del restaurante desde un unico lugar.
                </p>
              </div>
            </div>
            {primaryModules[0] ? (
              <Button
                render={<Link href={primaryModules[0].href} />}
                nativeButton={false}
                className="w-full md:w-auto"
              >
                Ir a {primaryModules[0].label}
                <ArrowRight aria-hidden="true" data-icon="inline-end" />
              </Button>
            ) : null}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/70 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <KeyRound aria-hidden="true" className="size-4" />
                Perfil
              </div>
              <p className="mt-2 text-lg font-medium">{roleLabel}</p>
            </div>
            <div className="rounded-lg bg-muted/70 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ClipboardList aria-hidden="true" className="size-4" />
                Modulos
              </div>
              <p className="mt-2 text-lg font-medium">{navigation.length}</p>
            </div>
            <div className="rounded-lg bg-muted/70 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck aria-hidden="true" className="size-4" />
                Acceso
              </div>
              <p className="mt-2 text-lg font-medium">Activo</p>
            </div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                <UserRound aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="rounded-lg bg-muted/70 px-3 py-3 text-muted-foreground">
              Los permisos de navegacion se aplican automaticamente segun tu
              perfil de usuario.
            </div>
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
