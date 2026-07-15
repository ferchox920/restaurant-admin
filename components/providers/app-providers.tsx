import { ReactNode } from "react";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { WebVitalsReporter } from "@/components/providers/web-vitals-reporter";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <WebVitalsReporter />
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
