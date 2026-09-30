import { EmptyState } from "@/components/feedback/empty-state";

type NoCurrentPriceStateProps = {
  channelName?: string | null;
};

export function NoCurrentPriceState({ channelName }: NoCurrentPriceStateProps) {
  return (
    <EmptyState
      title="Sin precio vigente"
      message={`Este producto todavia no tiene un precio vigente${channelName ? ` para ${channelName}` : ""}.`}
      className="w-full max-w-none shadow-none"
    />
  );
}
