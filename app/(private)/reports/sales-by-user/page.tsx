import { ModulePlaceholder } from "@/components/common/module-placeholder";

export default function ReportsSalesByUserPage() {
  return (
    <ModulePlaceholder
      title="Reporte de ventas por usuario"
      description="Esta pantalla reserva la subruta del futuro reporte de ventas por usuario dentro del shell privado."
      sprint="Sprint 5 o posterior"
      roles={["ADMIN", "MANAGER", "AUDITOR"]}
      notes="Sprint 3 no muestra rankings, metricas ni consultas reales para este reporte."
    />
  );
}
