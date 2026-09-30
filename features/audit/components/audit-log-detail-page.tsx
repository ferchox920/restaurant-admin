"use client";

import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { ErrorMessage } from "@/components/feedback/error-message";
import { LoadingState } from "@/components/feedback/loading-state";
import { AuditDataViewer } from "@/features/audit/components/audit-data-viewer";
import { AuditDiffView } from "@/features/audit/components/audit-diff-view";
import { AuditLogSummary } from "@/features/audit/components/audit-log-summary";
import { AuditMetadataView } from "@/features/audit/components/audit-metadata-view";
import { useAuditLog } from "@/features/audit/hooks/use-audit-log";
import { getApiErrorMessages } from "@/lib/api/error-messages";
import { HTTP_STATUS } from "@/lib/api/http-status";
import { isApiError } from "@/lib/api/is-api-error";

export function AuditLogDetailPage({ auditLogId }: { auditLogId: string }) {
  const auditLogQuery = useAuditLog(auditLogId);
  const isForbidden =
    auditLogQuery.error &&
    isApiError(auditLogQuery.error) &&
    auditLogQuery.error.statusCode === HTTP_STATUS.forbidden;
  const isNotFound =
    auditLogQuery.error &&
    isApiError(auditLogQuery.error) &&
    auditLogQuery.error.statusCode === HTTP_STATUS.notFound;

  if (auditLogQuery.isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <LoadingState
          title="Cargando evento"
          message="Estamos consultando el detalle del log de auditoria."
          className="w-full max-w-none shadow-none"
        />
      </section>
    );
  }

  if (auditLogQuery.error) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <PageHeader
          eyebrow="Auditoria"
          title="Registro de auditoria"
          description="Visualizacion segura de estado anterior, estado posterior y metadata."
        />
        <ErrorMessage
          variant={isForbidden ? "forbidden" : "general"}
          title={
            isForbidden
              ? "Acceso restringido"
              : isNotFound
                ? "Log no encontrado"
                : "No se pudo cargar el evento"
          }
          messages={
            isNotFound
              ? "El log solicitado no existe o ya no esta disponible."
              : getApiErrorMessages(auditLogQuery.error)
          }
        />
      </section>
    );
  }

  const log = auditLogQuery.data;

  if (!log) {
    return null;
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        eyebrow="Auditoria"
        title={`Registro ${log.id}`}
        description="Detalle de trazabilidad con defensa adicional sobre campos sensibles."
        actions={
          <Link
            href="/audit-logs"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Volver al listado
          </Link>
        }
      />

      <AuditLogSummary log={log} />

      <AuditDiffView beforeValue={log.beforeData} afterValue={log.afterData} />

      <div className="grid gap-4 xl:grid-cols-3">
        <AuditDataViewer
          title="Estado anterior"
          value={log.beforeData}
          emptyMessage="Sin estado anterior"
        />
        <AuditDataViewer
          title="Estado posterior"
          value={log.afterData}
          emptyMessage="Sin estado posterior"
        />
        <AuditMetadataView value={log.metadata} />
      </div>
    </section>
  );
}
