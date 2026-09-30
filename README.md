# Restaurant Admin

Frontend administrativo para la operación de un restaurante, construido con Next.js, TypeScript y React.

## Funcionalidad

- Autenticación JWT y navegación por roles.
- Usuarios y auditoría.
- Categorías, productos, costos y precios por canal.
- Inventario, movimientos y alertas de stock.
- Ventas, medios de pago y bancos.
- Mesas, salón y comandas.
- Reportes de ventas e inventario.
- Tema claro y oscuro.

La API es la fuente de verdad para autorización, precios, costos, stock, totales y datos históricos.

## Requisitos

- Node.js 24.19.0 y npm 11.6.2 (ver `.nvmrc` y `packageManager`).
- API del restaurante disponible.

## Configuración

```bash
npm ci
Copy-Item .env.example .env.local
```

Variables públicas:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Restaurant Admin
NEXT_PUBLIC_SESSION_MODE=bearer
NEXT_PUBLIC_WEB_VITALS_ENDPOINT=
NEXT_PUBLIC_REALTIME_ENABLED=false
NEXT_PUBLIC_STOCK_REPORT_PAGINATION=false
```

`NEXT_PUBLIC_WEB_VITALS_ENDPOINT` es opcional. Si se configura, el navegador
envia las metricas Web Vitals mediante `sendBeacon`.

`NEXT_PUBLIC_SESSION_MODE=cookie` activa el proxy de mismo origen `/backend` y
requiere que la API configure una cookie HttpOnly y el endpoint
`POST /api/auth/logout`. Durante la migracion, `bearer` conserva el flujo actual.

El tiempo real por SSE permanece desactivado por defecto. Solo debe habilitarse
cuando la API exponga `/api/operations/events` con autenticacion por cookie.

El catálogo POS opcional exige `POS_CATALOG_V1=true` en la API. La demo de
integración conserva este catálogo y la paginación opcional de reportes apagados.

La paginacion del reporte de stock acepta tanto la respuesta historica en forma
de array como el nuevo contrato `{ items, summary, total, limit, offset }`.

No deben incluirse secretos, credenciales, `DATABASE_URL` ni `JWT_SECRET` en variables `NEXT_PUBLIC_*`.

## Comandos

```bash
npm run dev       # http://localhost:5174
npm run lint
npm run test
npm run build
npm run start
npm run verify   # lint, formato sin escritura, TS, Vitest, build, presupuesto
npx playwright install chromium
npm run test:fullstack # Docker: dos vueltas con API fijada, PostgreSQL y seed propios
```

## Estructura

- `app/`: rutas y layouts de Next.js.
- `features/`: módulos funcionales, API, hooks, tipos y componentes.
- `components/`: UI y componentes compartidos.
- `lib/`: cliente HTTP, sesión, permisos, formatos y utilidades.
- `types/`: tipos compartidos entre módulos.

## Integración verificable

El recorrido usa el backend `e25b7e1d136247210c6a73c5cdc6d0b50c1eacfd`,
frontend de producción, cookies HttpOnly/Secure, comprobación de origen para
mutaciones y SSE con cursor `Last-Event-ID`. Docker debe estar disponible y los
puertos locales 55481–55483 libres. El runner clona la API por separado, instala
con `npm ci`, migra y ejecuta el seed ficticio; genera credenciales nuevas y elimina
solo sus procesos y contenedores al terminar cada vuelta. No requiere `.env.local`.

La configuración cookie/SSE se fija antes del build. En una demo manual, usar
`NEXT_PUBLIC_SESSION_MODE=cookie`, `NEXT_PUBLIC_REALTIME_ENABLED=true`, `API_URL`
y backend con `AUTH_COOKIE=true`, `AUTH_TOKEN_RESPONSE=false`, `OPERATIONS_SSE=true`,
`OPTIMISTIC_VERSIONING=true` y `CORS_ORIGIN` igual al origen exacto del frontend.
En producción se requiere HTTPS; Chromium acepta Secure sobre localhost en estas
pruebas locales. No existe refresh automático.

El modo bearer conserva su soporte y localStorage existente; logout solicita a la
API y limpia el cliente. Un JWT legacy sin `jti` sigue vigente en el backend después
de logout. SSE se conecta únicamente en modo cookie.

Confirmar, cerrar y anular conservan una clave y el payload en sessionStorage
cuando la respuesta es incierta, incluso al recargar. Reintentar los mismos datos
recupera la misma clave; cambiar datos inicia otra intención. Revisar primero el
estado del servidor. Una respuesta `STALE_VERSION` refresca los datos y pide revisar
la decisión; no repite automáticamente la mutación.

Logs, reportes, trazas y capturas quedan en `output/playwright/run-*`; son fixtures
ficticias y pueden contener sus tokens de sesión. CI los conserva 14 días. Ver
[resultados y límites](docs/verification/frontend-integration.md) y
[matriz de 76 consumidores HTTP](docs/verification/contract-matrix.md).

## Convenciones

- Las consultas remotas se gestionan con TanStack Query.
- Las mutaciones actualizan o invalidan las claves relacionadas.
- Los formularios usan React Hook Form y Zod.
- Los importes y cantidades decimales se conservan como strings en los modelos de respuesta.
- Los filtros y la paginación compatibles se envían a la API; no se simulan totales inexistentes.
