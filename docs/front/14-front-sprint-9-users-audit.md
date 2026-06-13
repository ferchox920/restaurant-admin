# 14 - Front Sprint 9 - Users And Audit

## Objetivo

Implementar gestion administrativa de usuarios y consulta de auditoria general
desde la UI, respetando el contrato real del backend `restaurat-api`.

## Politica de usuarios

- Los usuarios se crean desde `/users`.
- No existe registro publico.
- No se eliminan fisicamente.
- Desactivar y reactivar son acciones explicitas.
- Un usuario inactivo no puede iniciar sesion.
- El frontend nunca muestra `passwordHash`.
- La contrasena solo se solicita al crear usuario.
- No se implementa recuperacion de contrasena.
- No se implementa cambio de contrasena.
- No se implementa 2FA.
- El backend es la autoridad sobre roles y permisos.
- Cambiar un rol es una accion sensible y la UI exige confirmacion.

## Politica de auditoria

- Auditoria es solo lectura.
- No existen acciones de crear, editar o borrar logs.
- `beforeData` representa el estado anterior.
- `afterData` representa el estado posterior.
- `metadata` aporta contexto adicional.
- Los datos se muestran en formato JSON legible.
- El frontend aplica sanitizacion defensiva adicional.
- AuditLog no sustituye historial de costos, precios, movimientos ni snapshots.
- Las acciones de lectura no generan logs desde frontend.
- El frontend no reconstruye eventos ausentes del backend.
- El detalle puede mostrar un diff visual solo como ayuda representacional.

## Contrato real aplicado

### Users

- `GET /api/users`: `ADMIN` only, response array simple, sin filtros backend.
- `POST /api/users`: `email`, `password`, `firstName`, `lastName`, `role`.
- `GET /api/users/:id`: detalle simple.
- `PATCH /api/users/:id`: solo `email`, `firstName`, `lastName`, `role`.
- `PATCH /api/users/:id/deactivate`: cambia `active=false`.
- `PATCH /api/users/:id/reactivate`: cambia `active=true`.
- Las respuestas nunca incluyen `passwordHash`.
- Desactivar el ultimo `ADMIN` activo puede devolver `409`.

### Audit

- `GET /api/audit-logs`: `ADMIN` y `AUDITOR`, response array simple.
- `GET /api/audit-logs/:id`: detalle individual.
- Filtros reales: `userId`, `action`, `entityType`, `entityId`, `from`, `to`, `limit`, `offset`.
- Orden real: `createdAt desc`.
- No existe `total`.
- `limit` default backend `50`, maximo `100`.
- El actor viene como `userId`; no existe objeto `actor` embebido.

## Roles

- Users:
  - `ADMIN`: lista, crea, consulta, actualiza, desactiva y reactiva.
  - `MANAGER`, `CASHIER`, `AUDITOR`: sin acceso al modulo.
- Auditoria:
  - `ADMIN`: lectura.
  - `AUDITOR`: lectura.
  - `MANAGER`: sin acceso.
  - `CASHIER`: sin acceso.

## Rutas

- `/users`
- `/users/[id]`
- `/audit-logs`
- `/audit-logs/[id]`

## Selector de usuarios

- Solo puede consultar `/api/users` si el rol autenticado es `ADMIN`.
- No amplifica permisos desde frontend.
- `AUDITOR`, `MANAGER` y `CASHIER` no disparan requests a `/api/users`.
- En `/reports/sales-by-user` se mantiene filtro avanzado por UUID para `ADMIN`, `MANAGER` y `AUDITOR`.
- En `/reports/inventory-movements` se mantiene filtro avanzado por UUID para `createdById`.
- En auditoria, el selector de actor solo aparece para `ADMIN`.

## Detalle seguro de auditoria

- El detalle de `/audit-logs/[id]` muestra:
  - resumen;
  - estado anterior;
  - estado posterior;
  - metadata;
  - diff visual representacional.
- Todos los visores ejecutan `sanitizeAuditData` antes de renderizar.
- No se usa `dangerouslySetInnerHTML`.
- No se muestran claves sensibles como `password`, `passwordHash`, `token`, `accessToken`, `refreshToken`, `authorization`, `secret` o `secrets`.
- Si el formato no permite diff, la UI lo informa sin inventar datos del backend.
- Si los datos son malformados, la UI cae en estados seguros y legibles.

## Criterios de aceptacion

- listado de usuarios;
- creacion;
- detalle;
- actualizacion;
- desactivar/reactivar;
- listado de audit logs;
- filtros reales;
- detalle seguro de `beforeData`, `afterData` y `metadata`;
- diff visual representacional cuando aplica;
- sanitizacion defensiva;
- permisos correctos;
- loading, error, empty, 403, 404, 409;
- build y lint pasando cuando no haya bloqueo externo sobre `.next`.

## Cierre

- No se implemento recuperacion de contrasena.
- No se implemento cambio de contrasena.
- No se implemento 2FA.
- No se implemento gestion de sesiones.
- El siguiente sprint previsto es `Front Sprint 10 - Pulido UX, accesibilidad basica y deploy readiness`.
