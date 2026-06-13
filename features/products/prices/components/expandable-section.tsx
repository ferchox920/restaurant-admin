import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

type ExpandableSectionProps = {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function ExpandableSection({
  title,
  description,
  defaultOpen = false,
  children,
}: ExpandableSectionProps) {
  return (
    <details
      className="group rounded-lg border bg-card text-card-foreground shadow-sm"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-base font-semibold">{title}</span>
          {description ? (
            <span className="mt-1 block text-sm text-muted-foreground">
              {description}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="border-t px-5 py-4">{children}</div>
    </details>
  );
}
