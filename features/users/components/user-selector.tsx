"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserOptionLabel } from "@/features/users/components/user-option-label";
import { useUserOptions } from "@/features/users/hooks/use-user-options";

type UserSelectorProps = {
  value: string;
  onValueChange: (value: string) => void;
  includeInactive?: boolean;
  placeholder?: string;
  disabled?: boolean;
  includeAllOption?: boolean;
  allLabel?: string;
};

export function UserSelector({
  value,
  onValueChange,
  includeInactive = false,
  placeholder = "Selecciona un usuario",
  disabled = false,
  includeAllOption = false,
  allLabel = "Todos los usuarios",
}: UserSelectorProps) {
  const { data, canReadUsers } = useUserOptions({ includeInactive });

  if (!canReadUsers) {
    return null;
  }

  return (
    <Select value={value} onValueChange={(nextValue) => onValueChange(nextValue ?? "")}>
      <SelectTrigger className="w-full" disabled={disabled}>
        <SelectValue placeholder={placeholder}>
          {(selectedValue) => {
            if (includeAllOption && selectedValue === "__all__") {
              return allLabel;
            }

            const option = data.find((item) => item.id === selectedValue);

            return option
              ? `${option.label}${option.email ? ` (${option.email})` : ""}`
              : placeholder;
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {includeAllOption ? <SelectItem value="__all__">{allLabel}</SelectItem> : null}
        {data.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            <UserOptionLabel option={option} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
