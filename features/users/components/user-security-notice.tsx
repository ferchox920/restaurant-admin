export function UserSecurityNotice() {
  return (
    <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-medium">Seguridad</p>
      <p>
        Un usuario inactivo no podra iniciar sesion. El frontend nunca muestra
        <code className="mx-1">passwordHash</code> ni permite actualizar
        contrasenas desde este modulo.
      </p>
      <p className="mt-2">
        Si nunca inicio sesion, la UI muestra ese estado sin inferir actividad
        inexistente.
      </p>
    </div>
  );
}
