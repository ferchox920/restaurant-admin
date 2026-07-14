"use client";

import { useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/features/users/api/users.api";
import { usersQueryKeys } from "@/features/users/query-keys";
import type { UserOption } from "@/features/users/types/user-option.types";

type UseUserOptionsParams = {
  includeInactive?: boolean;
};

export function useUserOptions(params: UseUserOptionsParams = {}) {
  const { includeInactive = false } = params;
  const { user } = useAuth();
  const canReadUsers = user?.role === "ADMIN";
  const query = useQuery({
    queryKey: [...usersQueryKeys.options(), "all-pages"],
    queryFn: getAllUsers,
    enabled: canReadUsers,
  });

  const options = useMemo<UserOption[]>(() => {
    const source = query.data ?? [];

    return source
      .filter((item) => includeInactive || item.active)
      .map((item) => ({
        id: item.id,
        label: `${item.firstName} ${item.lastName}`,
        email: item.email,
        role: item.role,
        active: item.active,
      }));
  }, [includeInactive, query.data]);

  return {
    ...query,
    data: options,
    canReadUsers,
  };
}
