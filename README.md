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

- Node.js 20 o superior.
- API del restaurante disponible.

## Configuración

```bash
npm install
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

El contrato frontend para `GET /api/pos/catalog` limita cada pagina a 50
elementos y queda listo para conectarse cuando la API implemente el endpoint.

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
```

## Estructura

- `app/`: rutas y layouts de Next.js.
- `features/`: módulos funcionales, API, hooks, tipos y componentes.
- `components/`: UI y componentes compartidos.
- `lib/`: cliente HTTP, sesión, permisos, formatos y utilidades.
- `types/`: tipos compartidos entre módulos.

## Convenciones

- Las consultas remotas se gestionan con TanStack Query.
- Las mutaciones actualizan o invalidan las claves relacionadas.
- Los formularios usan React Hook Form y Zod.
- Los importes y cantidades decimales se conservan como strings en los modelos de respuesta.
- Los filtros y la paginación compatibles se envían a la API; no se simulan totales inexistentes.
