import { ArrowUpRight, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserRole } from "@/types/roles";

type ModulePlaceholderProps = {
  title: string;
  description: string;
  sprint: string;
  roles: UserRole[];
  notes: string;
  status?: "Proximamente" | "Modulo en construccion";
};

export function ModulePlaceholder({
  title,
  description,
  sprint,
  roles,
  notes,
  status = "Modulo en construccion",
}: ModulePlaceholderProps) {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(20rem,1fr)]">
        <Card className="bg-[linear-gradient(135deg,color-mix(in_oklch,var(--card),var(--sidebar-primary)_8%)_0%,var(--card)_100%)] shadow-sm">
          <CardHeader>
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <Clock3 aria-hidden="true" className="size-3.5" />
              {status}
            </div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>{description}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-background/70 p-4 ring-1 ring-foreground/10">
                <p className="text-xs font-semibold tracking-[0.16em] uppercase">
                  Sprint objetivo
                </p>
                <p className="mt-2 text-base font-medium text-foreground">
                  {sprint}
                </p>
              </div>
              <div className="rounded-2xl bg-background/70 p-4 ring-1 ring-foreground/10">
                <p className="text-xs font-semibold tracking-[0.16em] uppercase">
                  Roles esperados
                </p>
                <p className="mt-2 text-base font-medium text-foreground">
                  {roles.join(" - ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estado del modulo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2 rounded-xl bg-muted px-3 py-3">
              <ArrowUpRight
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-foreground"
              />
              <p>{notes}</p>
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-muted px-3 py-3">
              <Sparkles
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-foreground"
              />
              <p>
                Modulo en construccion. Esta pantalla no consume API, no monta
                formularios y no expone tablas reales en Sprint 3.
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-muted px-3 py-3">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-foreground"
              />
              <p>
                El acceso visual sigue gobernado por el rol autenticado y no
                reemplaza la autorizacion real del backend.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
