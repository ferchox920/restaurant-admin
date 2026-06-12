import { ModulePlaceholder } from "@/components/common/module-placeholder";

export default function ReportsStockPage() {
  return (
    <ModulePlaceholder
      title="Reporte de stock"
      description="Este placeholder representa el futuro reporte de stock general. La ruta existe para validar navegacion privada y acceso por rol."
      sprint="Sprint 5 o posterior"
      roles={["ADMIN", "MANAGER", "AUDITOR"]}
      notes="No se consultan datos reales ni se generan agregaciones en Sprint 3."
    />
  );
}
