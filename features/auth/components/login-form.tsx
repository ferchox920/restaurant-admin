"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChefHat, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthErrorAlert } from "@/features/auth/components/auth-error-alert";
import { useLogin } from "@/features/auth/hooks/use-login";
import {
  loginSchema,
  type LoginSchema,
} from "@/features/auth/schemas/login.schema";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { appName } from "@/lib/env";
import { isApiError } from "@/lib/api/is-api-error";
import { HTTP_STATUS } from "@/lib/api/http-status";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, login: authenticate } = useAuth();
  const loginMutation = useLogin();
  const [retryAfter, setRetryAfter] = useState(0);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, nextPath, router]);

  useEffect(() => {
    if (retryAfter <= 0) return;
    const timer = window.setInterval(() => {
      setRetryAfter((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [retryAfter]);

  const rootError = form.formState.errors.root?.message;
  const emailErrorId = form.formState.errors.email
    ? "login-email-error"
    : undefined;
  const passwordErrorId = form.formState.errors.password
    ? "login-password-error"
    : undefined;

  async function onSubmit(values: LoginSchema) {
    try {
      const response = await loginMutation.mutateAsync(values);

      await authenticate(response);
      router.replace(nextPath);
    } catch (error) {
      if (
        isApiError(error) &&
        error.statusCode === HTTP_STATUS.tooManyRequests
      ) {
        setRetryAfter(error.retryAfter ?? 5);
      }
      form.setError("root", {
        message: getApiErrorMessages(error).join("\n"),
      });
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f2e8] px-5 py-8 text-[#211a12] transition-colors dark:bg-[#10100e] dark:text-[#f8efe1] sm:px-8 lg:px-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(224,122,44,0.24),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(36,88,64,0.2),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(247,242,232,0.68))] dark:bg-[radial-gradient(circle_at_15%_15%,rgba(224,122,44,0.16),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(92,150,112,0.14),transparent_34%),linear-gradient(135deg,rgba(16,16,14,0.96),rgba(34,26,18,0.8))]" />
      <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#e0a23d]/20 blur-3xl dark:bg-[#d98d35]/10" />
      <div className="absolute right-5 top-5 z-10">
        <ThemeToggle />
      </div>
      <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#211a12]/10 bg-white/55 px-3 py-1.5 text-sm font-medium shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-[#f8efe1]">
            <Sparkles className="size-4 text-[#c56d1f]" aria-hidden="true" />
            Acceso operativo del restaurante
          </div>

          <div className="max-w-2xl space-y-5">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-[#211a12] text-[#fff6e7] shadow-xl shadow-[#211a12]/20 dark:bg-[#f8efe1] dark:text-[#211a12] dark:shadow-black/30">
              <ChefHat className="size-8" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8a4f20] dark:text-[#e4a85f]">
                {appName}
              </p>
              <h1 className="max-w-xl font-heading text-4xl font-semibold tracking-tight text-[#211a12] dark:text-[#fff6e7] sm:text-5xl lg:text-6xl">
                Gestiona ventas, stock y equipo desde un solo panel.
              </h1>
              <p className="max-w-lg text-base leading-7 text-[#5c4b38] dark:text-[#cbbda9] sm:text-lg">
                Ingresa con tu usuario habilitado para abrir el dashboard y
                continuar la operacion sin pasar por pantallas intermedias.
              </p>
            </div>
          </div>

          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {["Inventario vivo", "Ventas por canal", "Auditoria clara"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#211a12]/10 bg-white/50 p-4 text-sm font-medium shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10"
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>

        <Card className="w-full border-[#211a12]/10 bg-white/80 shadow-2xl shadow-[#5c3a1d]/15 backdrop-blur-xl [--card-spacing:--spacing(6)] dark:border-white/10 dark:bg-[#191815]/85 dark:shadow-black/30">
          <CardHeader className="gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#8a4f20] dark:text-[#e4a85f]">
                  Login seguro
                </p>
                <h2 className="font-heading text-3xl font-semibold tracking-tight text-[#211a12] dark:text-[#fff6e7]">
                  Entrar al dashboard
                </h2>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#f1dfbd] text-[#8a4f20] dark:bg-[#3a2b1d] dark:text-[#e4a85f]">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </div>
            </div>
            <p className="text-sm leading-6 text-[#6c5a45] dark:text-[#cbbda9]">
              Usa credenciales existentes en el backend o en el seed de datos.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-[#3a2b1d] dark:text-[#f8efe1]"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@restaurant.local"
                  required
                  className="h-11 border-[#d8c6aa] bg-[#fffaf2] px-3 text-[#211a12] placeholder:text-[#9b8974] focus-visible:border-[#c56d1f] focus-visible:ring-[#c56d1f]/25 dark:border-white/10 dark:bg-white/10 dark:text-[#fff6e7] dark:placeholder:text-[#958775]"
                  aria-invalid={Boolean(form.formState.errors.email)}
                  aria-describedby={emailErrorId}
                  {...form.register("email")}
                />
                {form.formState.errors.email ? (
                  <p id={emailErrorId} className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-[#3a2b1d] dark:text-[#f8efe1]"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Tu password"
                  required
                  className="h-11 border-[#d8c6aa] bg-[#fffaf2] px-3 text-[#211a12] placeholder:text-[#9b8974] focus-visible:border-[#c56d1f] focus-visible:ring-[#c56d1f]/25 dark:border-white/10 dark:bg-white/10 dark:text-[#fff6e7] dark:placeholder:text-[#958775]"
                  aria-invalid={Boolean(form.formState.errors.password)}
                  aria-describedby={passwordErrorId}
                  {...form.register("password")}
                />
                {form.formState.errors.password ? (
                  <p id={passwordErrorId} className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                ) : null}
              </div>

              {rootError ? (
                <AuthErrorAlert
                  message={rootError.split("\n").filter(Boolean)}
                />
              ) : null}

              <Button
                type="submit"
                disabled={
                  loginMutation.isPending || isLoading || retryAfter > 0
                }
                className="h-11 w-full bg-[#211a12] text-[#fff6e7] shadow-lg shadow-[#211a12]/20 hover:bg-[#3a2b1d] dark:bg-[#f8efe1] dark:text-[#211a12] dark:hover:bg-[#eadbc6]"
              >
                <Lock aria-hidden="true" data-icon="inline-start" />
                {loginMutation.isPending
                  ? "Ingresando..."
                  : retryAfter > 0
                    ? `Intenta nuevamente en ${retryAfter}s`
                    : "Abrir dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
