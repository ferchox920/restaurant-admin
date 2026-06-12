import { ModulePlaceholder } from "@/components/common/module-placeholder";

export default function ReportsPage() {
  return (
    <ModulePlaceholder
      title="Reportes"
      description="Los reportes reales quedaran para un sprint futuro con integracion backend. Sprint 3 deja la ruta privada y la navegacion por rol preparadas."
      sprint="Sprint 5 o posterior"
      roles={["ADMIN", "MANAGER", "AUDITOR"]}
      notes="El hub de reportes queda disponible para los roles de lectura definidos, pero sin metricas, graficos ni consultas reales."
      status="Proximamente"
    />
  );
}
