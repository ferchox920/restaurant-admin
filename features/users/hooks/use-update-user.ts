"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "@/features/users/api/users.api";
import { usersQueryKeys } from "@/features/users/query-keys";
import type { UpdateUserInput } from "@/features/users/types/user.types";

type UpdateUserPayload = {
  userId: string;
  data: UpdateUserInput;
};

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: UpdateUserPayload) => updateUser(userId, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: usersQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: usersQueryKeys.detail(variables.userId),
      });
      void queryClient.invalidateQueries({
        queryKey: usersQueryKeys.options(),
      });
    },
  });
}
