"use client";

import { useEffect } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, login: authenticate } = useAuth();
  const loginMutation = useLogin();

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
      form.setError("root", {
        message: getApiErrorMessages(error).join("\n"),
      });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {appName}
          </h1>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Inicia sesion para continuar.</p>
            <p>Las credenciales deben existir en el backend o en su seed de datos.</p>
          </div>

          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@restaurant.local"
                required
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Tu password"
                required
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
              <AuthErrorAlert message={rootError.split("\n").filter(Boolean)} />
            ) : null}

            <Button
              type="submit"
              disabled={loginMutation.isPending || isLoading}
              className="w-full"
            >
              <Lock aria-hidden="true" data-icon="inline-start" />
              {loginMutation.isPending ? "Ingresando..." : "Iniciar sesion"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="outline"
            className="w-full"
          >
            Volver al inicio
            <ArrowRight aria-hidden="true" data-icon="inline-end" />
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
