# 04 - Frontend Stack Decision

## Stack elegido

- `Next.js`
- `TypeScript`
- `App Router`
- `Tailwind CSS`
- `shadcn/ui`
- `TanStack Query`
- `React Hook Form`
- `Zod`

## Decision principal

El frontend sera un panel administrativo privado para operar el MVP del restaurante. `Next.js` se usara como framework de interfaz y composicion de pantallas, mientras que `NestJS` seguira siendo la fuente de verdad funcional y de autorizacion.

Principios de esta decision:

- el frontend consume la API existente y no se conecta directo a PostgreSQL;
- la logica critica de permisos, snapshots, stock, costos, precios y trazabilidad sigue del lado backend;
- el frontend no debe duplicar reglas de negocio criticas;
- el objetivo del stack es acelerar construccion de un panel interno mantenible, no crear otra capa de negocio.

## Uso de App Router

Se documenta `App Router` como base de navegacion del proyecto.

Politica inicial:

- rutas basadas en `app/`;
- layouts anidados para compartir estructura visual y control de sesion;
- segmentos por modulo para catalogo, inventario, ventas, reportes, auditoria y usuarios;
- layout privado para paginas autenticadas;
- pagina publica inicial en `/login`.

Esquema recomendado, sin imponer una nomenclatura mas compleja de la necesaria:

```txt
app/
  (public)/
    login/
  (private)/
    dashboard/
    categories/
    sales-channels/
    products/
    inventory/
    sales/
    reports/
    audit-logs/
    users/
```

Nota documental:

- `/settings` existe solo como placeholder futuro en la matriz de rutas del Sprint 0;
- no forma parte del alcance funcional activo ni obliga a crear estructura tecnica en el setup inicial.

## Server Components vs Client Components

La politica inicial no buscara maximizar Server Components por si mismos. Se usaran donde aporten claridad estructural, pero sin complicar autenticacion, mutaciones o interaccion operativa.

Lineamientos:

- usar Server Components para estructura estatica, shells y composicion cuando simplifique la lectura;
- usar Client Components para:
  - formularios;
  - tablas interactivas;
  - TanStack Query;
  - mutaciones;
  - manejo de sesion y token;
  - filtros;
  - toasts;
  - dialogos.

Decision practica:

- la mayoria de pantallas operativas del MVP seran `Client Components`;
- no se forzara Server Components si eso complica la implementacion del panel.

## Estado remoto

`TanStack Query` sera la base para estado remoto.

Responsabilidades esperadas:

- fetching de datos;
- cache por recurso y por filtros;
- invalidacion despues de mutaciones;
- manejo consistente de `loading`, `error` y `empty state`;
- soporte para mutaciones operativas del panel.

La sesion recuperada con `GET /api/auth/me` tambien se beneficiara de esta capa, aunque con reglas de cache cortas y controladas.

## Formularios

Se usara `React Hook Form` para construir formularios y `Zod` para validaciones de entrada del frontend.

Politica inicial:

- schemas por feature o modulo;
- validacion local para formato y completitud basica;
- errores de backend visibles en UI;
- el frontend no reemplaza validaciones criticas del backend.

## UI

La capa visual usara:

- `Tailwind CSS` para estilos utilitarios;
- `shadcn/ui` para componentes base reutilizables.

Criterio visual inicial:

- panel administrativo sobrio y claro;
- prioridad en legibilidad y velocidad de construccion;
- no construir un sistema visual complejo en Sprint 1.

## Autenticacion y sesion

Decision tecnica inicial:

- el backend entrega JWT en JSON desde `POST /api/auth/login`;
- el frontend persistira inicialmente `accessToken` en `localStorage`;
- la sesion se restablece consultando `GET /api/auth/me`;
- si el backend responde `401`, el frontend limpia sesion y redirige a `/login`;
- no se documenta una capa BFF;
- no se documentan cookies `HttpOnly` como decision inicial del MVP.

Esta politica es suficiente para un panel privado cliente en la etapa actual y evita introducir infraestructura adicional antes de que haga falta.

## Variables de entorno

Variables iniciales documentadas:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_NAME`

Uso esperado:

- `NEXT_PUBLIC_API_URL`: base URL del backend NestJS.
- `NEXT_PUBLIC_APP_NAME`: nombre visible del panel administrativo.

## Estructura propuesta del proyecto

```txt
app/
components/
features/
lib/
hooks/
types/
docs/
```

Responsabilidad de cada carpeta:

- `app/`: rutas, layouts y entrypoints del App Router.
- `components/`: componentes UI compartidos y piezas reutilizables de presentacion.
- `features/`: modulos funcionales del negocio, como auth, products, inventory o sales.
- `lib/`: utilidades transversales, cliente HTTP, helpers, config y wrappers tecnicos.
- `hooks/`: hooks reutilizables de UI o integracion.
- `types/`: tipos compartidos del frontend y shapes auxiliares.
- `docs/`: documentacion funcional y tecnica del frontend.

## Fuera de alcance tecnico inicial

No implementar todavia:

- SSR complejo;
- backend propio en Next;
- conexion directa a DB;
- middleware avanzado de auth si no hace falta;
- internacionalizacion completa;
- PWA;
- realtime;
- modo offline.

## Riesgos y decisiones a vigilar

- `localStorage` simplifica la primera etapa, pero no reemplaza una estrategia mas robusta si el proyecto luego requiere mayor hardening.
- el panel sera mayormente cliente; si en el futuro aparecen necesidades de SEO o server rendering complejo, la politica podra revisarse.
- la estructura propuesta debe sostener modulos operativos sin volver a mezclar reglas de negocio en la UI.
