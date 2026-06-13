"use client";

import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/features/users/api/users.api";
import { usersQueryKeys } from "@/features/users/query-keys";

type UseUserOptions = {
  enabled?: boolean;
};

export function useUser(userId: string | undefined, options: UseUserOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: usersQueryKeys.detail(userId ?? ""),
    queryFn: () => getUser(userId as string),
    enabled: enabled && Boolean(userId),
  });
}
