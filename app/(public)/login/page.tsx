import { LoginForm } from "@/features/auth/components/login-form";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = resolvedSearchParams?.next || "/dashboard";

  return <LoginForm nextPath={nextPath} />;
}
