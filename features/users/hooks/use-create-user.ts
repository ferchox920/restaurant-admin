"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "@/features/users/api/users.api";
import { usersQueryKeys } from "@/features/users/query-keys";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: usersQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: usersQueryKeys.options(),
      });
    },
  });
}
