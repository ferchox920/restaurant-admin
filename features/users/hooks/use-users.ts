"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/features/users/api/users.api";
import { usersQueryKeys } from "@/features/users/query-keys";

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: usersQueryKeys.list(),
    queryFn: getUsers,
    enabled,
  });
}
