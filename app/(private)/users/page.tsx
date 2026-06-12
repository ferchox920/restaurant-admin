import { ModulePlaceholder } from "@/components/common/module-placeholder";

export default function UsersPage() {
  return (
    <ModulePlaceholder
      title="Usuarios"
      description="La gestion de usuarios del panel administrativo no forma parte de Sprint 3. Este placeholder existe para validar el acceso visual exclusivo de ADMIN."
      sprint="Sprint 5 o posterior"
      roles={["ADMIN"]}
      notes="La administracion real de usuarios se implementara despues; por ahora solo se asegura el acceso visual exclusivo de ADMIN."
      status="Proximamente"
    />
  );
}
