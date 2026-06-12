# 07 - Front Sprint 2 Auth Session

## Objetivo del Sprint 2

El Front Sprint 2 implemento autenticacion real, sesion de usuario, cliente API
centralizado y proteccion inicial de rutas privadas para el frontend
administrativo.

El alcance efectivo de este sprint incluye:

- login real contra la API backend;
- persistencia de `accessToken` en `localStorage`;
- recuperacion de sesion con `GET /api/auth/me`;
- logout;
- guard de rutas privadas en cliente;
- pantalla de acceso denegado para `403`;
- estados visuales reutilizables para loading y errores de auth.

## Archivos principales

- `lib/api/api-client.ts`: cliente HTTP centralizado con base URL, headers JSON,
  Bearer token y `ApiError`.
- `lib/api/api-error.ts`: error HTTP normalizado para consumo seguro en UI.
- `lib/api/error-messages.ts`: mapeo de mensajes visuales seguros para `401`,
  `403` y fallback generico.
- `lib/auth/token-storage.ts`: persistencia de token y sincronizacion con
  `localStorage`.
- `features/auth`: tipos, schemas, hooks y componentes de login/sesion.
- `components/providers/auth-provider.tsx`: provider real de auth usado en la
  app. El prompt original sugeria `features/auth/providers/auth-provider.tsx`,
  pero en la implementacion final el provider vive en `components/providers`
  mientras `features/auth/hooks/use-auth.ts` expone el acceso estable al
  contexto.
- `components/auth/private-route.tsx`: proteccion de sesion para route group
  privado.
- `components/auth/role-guard.tsx`: validacion inicial de acceso por rol/ruta.
- `app/(public)/login/page.tsx`: wrapper server para la pagina publica de login.
- `app/(private)/layout.tsx`: integracion del guard privado.
- `app/(private)/dashboard/page.tsx`: dashboard autenticado minimo.
- `app/forbidden/page.tsx`: pantalla de acceso denegado.

## Endpoints consumidos

- `POST /api/auth/login`
- `GET /api/auth/me`

## Politica de sesion

- El frontend consume autenticacion desde la API backend.
- El backend sigue siendo la fuente de verdad para autenticacion y permisos.
- El `accessToken` se guarda en `localStorage`.
- La sesion se recupera consultando `GET /api/auth/me`.
- Si la API responde `401`, se limpia sesion y se redirige a `/login`.
- Si la API responde `403`, la sesion se conserva y la UI muestra acceso
  denegado.
- No se implementa refresh token en este sprint.
- No se implementa cookie `httpOnly` en este sprint.
- No se guarda password.
- No se imprime token ni errores sensibles en consola.

## Rutas afectadas

- `/login`
- `/dashboard`
- `/forbidden`

## Manejo visual de errores

- `401`: `Tu sesión no es válida o expiró. Inicia sesión nuevamente.`
- `403`: `No tienes permisos para realizar esta acción.`
- `500` o error desconocido: `Ocurrió un error inesperado. Intenta nuevamente.`

Si el backend devuelve `message` como array, la UI muestra los mensajes de forma
ordenada y segura, sin exponer stack traces ni payloads sensibles.

## Que NO se implemento todavia

- no hay layout administrativo completo;
- no hay sidebar;
- no hay navegacion administrativa final;
- no hay CRUDs;
- no hay catalogo;
- no hay inventario;
- no hay ventas;
- no hay reportes;
- no hay auditoria UI;
- no hay gestion de usuarios UI;
- no hay refresh token;
- no hay hardening final de sesion con cookies `httpOnly` o estrategia avanzada.

## Criterios de cierre del Sprint 2

- login funcional;
- recuperacion de sesion;
- logout;
- rutas privadas protegidas;
- `401` limpia sesion;
- `403` muestra acceso denegado;
- token no aparece en consola;
- build pasa;
- lint pasa;
- documentacion actualizada.
