import { ModulePlaceholder } from "@/components/common/module-placeholder";

export default function ReportsInventoryMovementsPage() {
  return (
    <ModulePlaceholder
      title="Reporte de movimientos de inventario"
      description="Este placeholder representa el futuro reporte de movimientos de inventario y confirma que la subruta privada ya queda reservada."
      sprint="Sprint 5 o posterior"
      roles={["ADMIN", "MANAGER", "AUDITOR"]}
      notes="No se muestran tablas reales ni resultados calculados mientras el modulo siga fuera de alcance."
    />
  );
}
