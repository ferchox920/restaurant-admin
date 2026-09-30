import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SelectableSalesChannel = {
  id: string;
  name: string;
  active: boolean;
};

type SalesChannelSelectorProps = {
  channels: SelectableSalesChannel[];
  selectedChannelId?: string;
  onChange: (channelId: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function SalesChannelSelector({
  channels,
  selectedChannelId,
  onChange,
  placeholder = "Selecciona un canal",
  disabled = false,
}: SalesChannelSelectorProps) {
  return (
    <Select
      value={selectedChannelId ?? ""}
      onValueChange={(value) => onChange(value || undefined)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {(value) =>
            channels.find((channel) => channel.id === value)?.name ??
            placeholder
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {channels.map((channel) => (
          <SelectItem key={channel.id} value={channel.id}>
            {channel.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
