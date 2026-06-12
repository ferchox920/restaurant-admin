import { ModulePlaceholder } from "@/components/common/module-placeholder";

export default function AuditLogsPage() {
  return (
    <ModulePlaceholder
      title="Auditoria"
      description="La visualizacion de trazabilidad y eventos de auditoria se desarrollara en un sprint posterior. Por ahora esta ruta valida permisos visuales para ADMIN y AUDITOR."
      sprint="Sprint 5 o posterior"
      roles={["ADMIN", "AUDITOR"]}
      notes="La ruta de auditoria solo existe para validar navegacion y guard visual; el backend seguira siendo la fuente real de autorizacion."
      status="Proximamente"
    />
  );
}
