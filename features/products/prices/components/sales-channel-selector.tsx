import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { SalesChannel } from "@/features/sales-channels/types/sales-channel.types";

export type SelectableSalesChannel = Pick<
  SalesChannel,
  "id" | "name" | "active" | "commissionType" | "commissionValue"
>;

type SalesChannelSelectorProps = {
  channels: SelectableSalesChannel[];
  selectedChannelId?: string;
  onChange: (channelId: string | undefined) => void;
  description?: string;
};

export function SalesChannelSelector({
  channels,
  selectedChannelId,
  onChange,
  description = "El historial y el precio vigente se muestran para el canal seleccionado.",
}: SalesChannelSelectorProps) {
  const selectedChannel = channels.find(
    (channel) => channel.id === selectedChannelId
  );

  return (
    <div className="space-y-2">
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      <Select
        value={selectedChannelId}
        onValueChange={(value) => onChange(value ?? undefined)}
      >
        <SelectTrigger className="w-full">
          <span className="flex flex-1 text-left">
            {selectedChannel
              ? `${selectedChannel.name}${!selectedChannel.active ? " (inactivo)" : ""}`
              : "Selecciona un canal"}
          </span>
        </SelectTrigger>
        <SelectContent>
          {channels.map((channel) => (
            <SelectItem key={channel.id} value={channel.id}>
              {channel.name}
              {!channel.active ? " (inactivo)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
