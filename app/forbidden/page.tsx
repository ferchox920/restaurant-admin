import { ForbiddenState } from "@/components/feedback/forbidden-state";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-16">
      <ForbiddenState message="No tienes permisos para realizar esta accion." />
    </main>
  );
}
