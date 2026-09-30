# Demo reproducible y guía de evaluación

Interfaz [PR draft #1](https://github.com/ferchox920/restaurant-admin/pull/1), API [PR draft #1](https://github.com/ferchox920/restaurant-api/pull/1). Backend fijado: `5562dec6cef7c00f76c31cc5bf663f5cf282ae14`; [CI y CodeQL inspeccionados](verification/backend-final-ci.json). Esta demo usa datos ficticios y recursos locales propios. No despliega, publica releases ni fusiona los PR.

## Desde cero en Windows / PowerShell

Requisitos: Git, Docker, Node 24.19.0 y npm 11.6.2. Comprobar `node --version`, `npm --version` y `docker version`. Mantener el runtime fijado: un npm diferente no demuestra instalación reproducible del lockfile.

```powershell
git clone --branch portfolio/backend-foundation https://github.com/ferchox920/restaurant-api.git restaurant-api-demo
git clone --branch portfolio/frontend-integration https://github.com/ferchox920/restaurant-admin.git restaurant-admin-demo
cd restaurant-api-demo
git checkout --detach 5562dec6cef7c00f76c31cc5bf663f5cf282ae14
$demoDbPassword = [guid]::NewGuid().ToString('N')
$demoAdminPassword = 'Demo-' + [guid]::NewGuid().ToString('N')
$demoJwtSecret = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
docker run -d --name restaurant-portfolio-demo -p 127.0.0.1:55473:5432 -e POSTGRES_USER=demo -e "POSTGRES_PASSWORD=$demoDbPassword" -e POSTGRES_DB=restaurant_demo postgres:17.9
docker exec restaurant-portfolio-demo pg_isready -U demo
@"
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://demo:${demoDbPassword}@localhost:55473/restaurant_demo?schema=public
JWT_SECRET=$demoJwtSecret
JWT_EXPIRES_IN=1d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=$demoAdminPassword
ADMIN_FIRST_NAME=Demo
ADMIN_LAST_NAME=Admin
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3001
SWAGGER_ENABLED=false
MERCADO_PAGO_ENABLED=false
AUTH_COOKIE=true
AUTH_TOKEN_RESPONSE=false
OPTIMISTIC_VERSIONING=true
OPERATIONS_SSE=true
"@ | Set-Content .env
npm ci
npm run prisma:generate
npm run db:migrate:deploy
npm run db:seed
# Credencial ficticia generada solo para esta sesión local; no publicar ni capturar.
Write-Host "Usuario: admin@example.com / Password local: $demoAdminPassword"
npm run build
npm run start:prod
```

Esperar que `pg_isready` indique que acepta conexiones; no usar una base existente ni otro contenedor con el mismo nombre. Conservar la contraseña generada localmente para login. El archivo `.env` queda ignorado por Git; no copiarlo a evidencias.

En una segunda terminal, desde la carpeta de la interfaz clonada:

```powershell
cd restaurant-admin-demo
@'
API_URL=http://localhost:3000
NEXT_PUBLIC_SESSION_MODE=cookie
NEXT_PUBLIC_APP_NAME=Restaurant Admin
NEXT_PUBLIC_REALTIME_ENABLED=true
NEXT_PUBLIC_POS_CATALOG_ENABLED=true
NEXT_PUBLIC_STOCK_REPORT_PAGINATION=true
'@ | Set-Content .env.local
npm ci
npm run build
npm run bundle:check
npm run start -- --port 3001
```

Abrir [localhost:3001](http://localhost:3001). La configuración recomendada única es cookie persistida, proxy `/backend` del mismo origen, versiones obligatorias y SSE habilitado. En localhost Chromium admite la cookie Secure; esta guía no demuestra una instalación pública ni configura HTTPS de un despliegue. No introducir tokens en localStorage.

Para terminar: Ctrl+C en ambas terminales y `docker rm -f -v restaurant-portfolio-demo`, únicamente si es el contenedor creado con estos pasos. Los archivos `.env` locales contienen credenciales descartables y deben permanecer privados.

## Recorrido visual breve

1. Login con la cuenta ficticia local. Revisar validación, contraste, foco de teclado y lectura de errores.
2. Salón: abrir una mesa libre en canal Salón. La orden vacía no puede cerrarse.
3. Comanda: agregar Coca-Cola, modificar cantidad y revisar total autoritativo; confirmar cierre en efectivo. El cierre afecta stock una sola vez.
4. Venta: abrir el ticket asociado y comprobar estado confirmado, medio de pago y snapshots históricos.
5. Inventario: comprobar stock y movimiento SALE_OUT de esa venta. Anularla desde la interfaz si se desea comprobar reversión única.
6. Auditoría: revisar acciones, actor ficticio y recurso; no publicar datos de un negocio real.
7. Reportes: comparar venta e inventario con el ticket y el movimiento. Tras anulación, los reportes excluyen esa venta según las reglas existentes.

Las [capturas reales](screenshots/) corresponden a login, salón, comanda, venta, inventario, auditoría y reportes de los tests sobre servicios reales. El agente inspeccionó las siete antes de versionar; no se realizó revisión visual humana. El [manifest](screenshots/manifest.json) conserva dimensiones, hashes y origen. Representan distintos pasos: comanda con cantidad 2, venta con cantidad 3 después del escenario concurrente, y salón después de resync. Chromium móvil se **emula**; no se ha probado un dispositivo físico.

## Arquitectura y decisiones

```mermaid
flowchart LR
  UI[Next.js / React] --> Proxy[Proxy del mismo origen]
  Proxy --> API[NestJS: cookie y permisos actuales]
  API --> Tx[Transacción serializable Prisma]
  Tx --> PG[(PostgreSQL)]
  PG --> Events[Eventos persistidos / LISTEN y polling]
  Events --> SSE[SSE: sesión, rol, replay y cierre acotado]
  SSE --> UI
```

La API conserva la autoridad sobre totales, precios, stock y permisos. Versiones decimal string detectan escrituras obsoletas. La respuesta idempotente comparte transacción con el efecto comercial; la interfaz persiste clave y payload antes de enviar y permite recuperar una respuesta incierta sin reconstruir datos ni repetir automáticamente una mutación. SSE invalida lecturas, no ejecuta acciones comerciales. La retención del replay requiere una señal de resync y refetch autorizado.

No hay ownership, multitenancy ni infraestructura distribuida. Sesiones y outbox permanecen en PostgreSQL. El bearer legacy sin jti no se revoca mediante logout; eliminar almacenamiento local no revoca una copia externa. Los registros idempotentes históricos incompletos conservan conflicto y requieren reconciliación conservadora; las claves confirmadas se retienen indefinidamente. [Política y límites detallados](https://github.com/ferchox920/restaurant-api/blob/portfolio/backend-foundation/docs/verification/final-stage.md).

Límites de presentación existentes visibles en las capturas: algunas vistas muestran UUID de actor y etiquetas fallback para acciones/entidades de comanda; el detalle de venta puede mostrar “Sin canal” cuando no recibe el nombre relacionado, aunque conserva salesChannelId y el reporte resuelve el canal. Estos textos no alteran el efecto comercial ni sus importes; quedan señalados para la evaluación visual del autor.

## Verificación automatizada

```powershell
npm ci
npm run audit:check
npm run verify
npx playwright install chromium
npm run test:fullstack
```

El runner crea sus propias bases y procesos, instala y construye el backend del SHA fijado, valida contrato y presupuesto original, ejecuta dos vueltas limpias y elimina únicamente sus recursos. Cinco escenarios de navegador por proyecto y vuelta: recorrido comercial amplio, conflicto UI, respuesta perdida UI, logout UI y expiración UI. Escritorio + Chromium móvil emulado, sin retries automáticos ni skips. Las cuentas automatizadas son descartables; traces, JSON y HTML se sanean antes de publicar artifacts. No se publican storageState, cookies ni JWT utilizables.

La CI se verifica sobre el último SHA de cada PR; un build local o CodeQL verde no sustituyen esa comprobación. Los informes anteriores se conservan como antecedentes y no se cuentan como nuevas ejecuciones.

## Material laboral

Descripción para CV: **Desarrollé un sistema de administración de restaurante con Next.js, NestJS y PostgreSQL, con ventas e inventario transaccionales, control de concurrencia mediante versiones, recuperación idempotente de respuestas perdidas y actualización SSE ligada a sesiones y permisos. Añadí pruebas de integración con persistencia real, recorridos de navegador y CI reproducible.**

Cinco puntos para entrevista:

1. Una respuesta perdida no significa operación fallida: persistir clave y payload antes del envío permite recuperar el resultado confirmado.
2. Versiones y transacciones serializables protegen decisiones comerciales concurrentes; el conflicto se muestra y requiere revisión del usuario.
3. Venta, movimiento, auditoría, evento y respuesta idempotente se confirman juntos; los históricos incompletos no autorizan repetición incierta.
4. Un SSE autenticado al conectar puede quedar autorizado indebidamente: se valida sesión/rol periódicamente, se filtran datos y se liberan recursos en cada salida.
5. La evidencia distingue inspección, pruebas locales, CI y revisión humana; conserva fallos y demuestra escenarios reales sin reemplazar la API comercial por mocks.

Única próxima acción del autor tras la verificación técnica: realizar el recorrido visual humano descrito y registrar sus observaciones antes de revisar los PR para una eventual integración.
