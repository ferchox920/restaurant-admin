import { EmptyState } from "@/components/feedback/empty-state";

export function NoCurrentCostState() {
  return (
    <EmptyState
      title="Sin costo vigente"
      message="Este producto todavia no tiene una version vigente de costo."
      className="w-full max-w-none shadow-none"
    />
  );
}
