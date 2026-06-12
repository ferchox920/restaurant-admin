import { ModulePlaceholder } from "@/components/common/module-placeholder";

export default function ReportsSalesByChannelPage() {
  return (
    <ModulePlaceholder
      title="Reporte de ventas por canal"
      description="Esta ruta prepara el futuro reporte de ventas segmentado por canal comercial sin consumir endpoints en Sprint 3."
      sprint="Sprint 5 o posterior"
      roles={["ADMIN", "MANAGER", "AUDITOR"]}
      notes="La pantalla valida subrutas privadas de reportes y el guard visual por rol."
    />
  );
}
