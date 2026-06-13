# Front Sprint 10.9 - Frontend Test Plan

## Objetivo

Dejar una suite minima, determinista y de alto valor para el frontend MVP sin
abrir una estrategia E2E pesada ni depender de backend real.

## Infraestructura adoptada

- `Vitest` como runner principal;
- `@testing-library/react` para componentes criticos;
- `@testing-library/jest-dom` para aserciones semanticas de DOM;
- `jsdom` solo para tests de componentes.

La configuracion separa:

- tests puros en entorno `node`;
- tests `*.test.tsx` en entorno `jsdom`.

## Cobertura incluida

- auth y sesion:
  - storage defensivo en server y browser;
  - limpieza de sesion en `401` desde `AuthProvider`;
  - conservacion de sesion en `403`;
  - redireccion privada a `/login?next=...`.
- permisos:
  - `canAccessRoute`;
  - `RoleGuard`.
- utilidades criticas:
  - dinero;
  - cantidades;
  - mensajes API;
  - query params;
  - retry policy;
  - formatters de reportes;
  - sanitizacion de auditoria;
  - schemas de filtros de reportes y auditoria.
- componentes criticos:
  - `ForbiddenState`;
  - `StatusBadge` y badge representativo de ventas;
  - `SaleTicketCriticalActions` para visibilidad de mutaciones por rol.

## Cobertura no incluida

- flujos E2E completos;
- mocking de backend de punta a punta;
- snapshots de interfaz;
- pruebas exhaustivas de cada formulario o tabla;
- performance o carga;
- navegacion real en browser con usuarios seed.

## Criterio de tamano

La suite sigue siendo pequena a proposito:

- prioriza logica estable y reglas de permiso;
- evita acoplarse a implementaciones visuales fragiles;
- reduce costo de mantenimiento para el MVP.

## Limitaciones actuales

- varias decisiones de UI se validan todavia en revision manual;
- los tests de componentes mockean router y auth en el borde;
- no existe cobertura E2E real contra backend sembrado;
- la suite no reemplaza la validacion integrada previa a deploy.
