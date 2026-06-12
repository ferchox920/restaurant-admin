import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-1">
          <h1 className="font-heading text-2xl leading-tight font-medium sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-3xl text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
