"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/features/auth/api/auth.api";

type UseCurrentUserOptions = {
  enabled?: boolean;
};

export function useCurrentUser(options: UseCurrentUserOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    enabled,
    retry: false,
  });
}
