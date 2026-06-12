"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const { logout, isLoading } = useAuth();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={logout}
      disabled={isLoading}
      className={cn(className)}
    >
      <LogOut data-icon="inline-start" />
      Logout
    </Button>
  );
}
