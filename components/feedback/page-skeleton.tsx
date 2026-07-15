import { cn } from "@/lib/utils";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-muted", className)}
    />
  );
}

export function PageSkeleton() {
  return (
    <section
      className="mx-auto flex w-full max-w-7xl flex-col gap-6"
      aria-label="Cargando contenido"
      aria-busy="true"
    >
      <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="mt-3 h-8 w-64 max-w-full" />
        <SkeletonBlock className="mt-3 h-4 w-[32rem] max-w-full" />
      </div>
      <div className="grid min-h-24 gap-3 sm:grid-cols-3">
        <SkeletonBlock />
        <SkeletonBlock />
        <SkeletonBlock />
      </div>
      <div className="min-h-96 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <SkeletonBlock className="h-10 w-full" />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <SkeletonBlock key={index} className="h-40" />
          ))}
        </div>
      </div>
    </section>
  );
}
