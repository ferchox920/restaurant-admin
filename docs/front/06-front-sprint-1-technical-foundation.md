# 06 - Front Sprint 1 Technical Foundation

## Objetivo del Sprint 1

Front Sprint 1 creo la base tecnica inicial del frontend administrativo con
`Next.js`, dejando listo el proyecto para avanzar luego con auth, sesion y
cliente API.

## Stack instalado/configurado

- `Next.js`
- `TypeScript`
- `App Router`
- `Tailwind CSS`
- `shadcn/ui`
- `TanStack Query`
- `React Hook Form`
- `Zod`

## Estructura creada

Carpetas principales creadas o consolidadas:

- `app`
- `components`
- `components/ui`
- `features`
- `lib`
- `hooks`
- `types`
- `docs/front`

La estructura modular base ya existe para soportar crecimiento por modulos, pero
la mayoria de esas carpetas siguen siendo placeholders tecnicos en este sprint.

## Variables de entorno

Variables publicas iniciales:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_NAME`

Criterio actual:

- no se guardan secretos en el frontend;
- `NEXT_PUBLIC_API_URL` usa fallback a `http://localhost:3000`;
- `NEXT_PUBLIC_APP_NAME` usa fallback a `Restaurant Admin`.

## Rutas disponibles

Rutas expuestas actualmente:

- `/`
- `/login`
- `/dashboard`

Estas rutas son placeholders tecnicos. En codigo, `/login` y `/dashboard` hoy
estan implementadas mediante route groups del App Router en `app/(public)` y
`app/(private)`, sin cambiar las URLs publicas.

## Que NO se implemento todavia

- no hay auth real;
- no hay login real;
- no hay rutas protegidas;
- no hay consumo de API;
- no hay CRUDs;
- no hay inventario;
- no hay ventas;
- no hay reportes;
- no hay auditoria UI;
- no hay usuarios UI;
- no hay deploy.

## Comandos principales

```bash
npm run dev
npm run build
npm run lint
```

## Criterios de aceptacion

- el proyecto levanta;
- el build pasa;
- Tailwind funciona;
- `shadcn/ui` esta instalado;
- las variables de entorno estan documentadas;
- las rutas placeholder existen;
- `docs/front` fue preservado.
