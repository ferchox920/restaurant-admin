# Frontend integration: contrato y evidencia

Fecha: 2026-09-30. Frontend `ferchox920/restaurant-admin`.
Base limpia de `origin/main`: `2982f52136c7929d72b38bda29cbb5aa325a54b3`.
Rama `portfolio/frontend-integration`. Backend separado y fijado por commit:
`e25b7e1d136247210c6a73c5cdc6d0b50c1eacfd`.
Los checkouts habituales, incluyendo cambios locales de pagos del usuario,
permanecen intactos. No se modifica el backend, licencias ni infraestructura cloud.

## Evidencia del backend comprobada

Se consultaron nuevamente jobs y logs de
[CI del backend](https://github.com/ferchox920/restaurant-api/actions/runs/36725620007):
job `109921614908` registra 304 tests/44 suites; `109921615029`, 32 tests/3 suites;
`109921615123`, 1 test/1 suite. Los tres concluyen success: 337 tests, sin skips.
Es evidencia remota del PR sobre su merge de prueba con el head e25b7e1; no se
presenta como nueva ejecución local de esas 337 pruebas en esta etapa.
[CodeQL](https://github.com/ferchox920/restaurant-api/actions/runs/36725620198),
job `109921618727`, contiene `Successfully uploaded results` y estado de análisis
completo. El commit existe en el clon nuevo y se leyó su documento de contrato.
El [PR backend #1](https://github.com/ferchox920/restaurant-api/pull/1) sigue abierto.

## Línea base y cambios

| Control ejecutado    | Base                                          | Resultado final                             |
| -------------------- | --------------------------------------------- | ------------------------------------------- |
| npm ci               | EUSAGE: wasi-threads 1.2.2 no satisface 1.2.3 | Reparado y verificado nuevamente            |
| lint sin fix         | 0 errores                                     | 0 errores; exit 0                           |
| Vitest               | 71 tests, 28 suites                           | 86 tests, 34 suites; 0 fallos, 0 skips      |
| TypeScript explícito | pasó                                          | pasó; exit 0                                |
| build de producción  | pasó                                          | producción real usada en recorridos         |
| bundle:check         | 7 rutas dentro de presupuesto                 | límites originales conservados              |
| formato              | 233 archivos fuera del formato predeterminado | Normalización mecánica; check sin escritura |
| npm audit completo   | 18: 2 bajas, 6 moderadas, 9 altas, 1 crítica  | 3 de desarrollo: 1 baja, 2 moderadas        |
| npm audit producción | 14: 1 baja, 4 moderadas, 8 altas, 1 crítica   | 0                                           |

Node 24.19.0/npm 11.6.2 fijados. Next/eslint-config-next 16.3.7, React 19.2.4,
Playwright 1.61.1 y Chromium 149.0.7827.55. El lockfile recibió la reparación de
wasi-threads y ajustes de metadata de dependencias opcionales, luego actualizaciones
compatibles de Next y dependencias auditadas; `npm audit fix` se ejecutó sin force.
La normalización Prettier tiene cambios mecánicos en el código previo y no altera
el diseño. La diferencia funcional se concentra en sesión, versiones, claves, SSE,
invalidaciones y diálogos. Cada una tiene tests específicos.

Avisos restantes: Vitest/@vitest/mocker moderados requieren Vitest 5 según audit;
esbuild 0.27.7 conserva aviso bajo. Se usa `vitest run`, sin servidor de desarrollo
expuesto. No se fuerza un cambio mayor ajeno a esta integración. La publicación
Next 16.3.8 estaba anunciada para este día, pero `npm view next@16.3.8 version`
devolvió E404; no se instala una versión anunciada como si existiera.
[Avisos oficiales de Next](https://nextjs.org/blog).

## Matriz semántica HTTP y SSE

[Matriz HTTP](contract-matrix.md) y [JSON con DTO/params/respuestas](contract-matrix.json)
contrastan 76 consumidores con OpenAPI ejecutado y controladores del SHA fijado.
Todos tienen método/ruta presentes. El JSON conserva schemas de cuerpos y respuestas,
campos requeridos, filtros y roles extraídos; no acredita ejecución de todos los CRUD.

| Familia                | Payload / respuesta / permisos / errores contrastados                                                                                                                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth                   | login email/password → user y token opcional; me → usuario; logout 204. Cookie omite token en demo. Login público; me/logout JWT. 400/401 y límite de login 5/minuto                                                                          |
| catálogo y referencias | CRUD de usuarios solo ADMIN; categorías/productos/canales/bancos/mesas según roles del controlador. listados limit/offset arrays, activos/search según DTO. Se preserva fetchAllPages y filtros existentes                                    |
| costos/precios         | entradas number conforme a DTO; respuestas Decimal string y vigencias ISO. No se sustituyen snapshots ni totales calculados por servidor                                                                                                      |
| inventario             | movimientos y stocks Decimal string; operaciones JSON number; versiones de stock string. Roles de escritura/lectura en matriz; filtros, limit/offset, 400/403/409                                                                             |
| comandas               | abrir usa salesChannelId/notes; ítems number positivo convertido desde texto, restringido a decimal(10,2). Respuesta incluye ticket, snapshots, total y version string. ADMIN/MANAGER/CASHIER mutan; AUDITOR lee                              |
| ventas                 | create/update/payment/cancel/confirm/void contrastados con DTO. Confirm/cierre CASH sin banco, TRANSFER requiere banco; void reason. Solo ADMIN/MANAGER anulan; AUDITOR lee                                                                   |
| versiones              | expectedVersion string en bodies y en query DELETE de ambas familias. Se agregaron versiones también en rutas de edición alternativas. 409 STALE_VERSION refresca exactamente el recurso y pide revisar; retry de mutaciones false            |
| reportes/auditoría     | ADMIN/MANAGER/AUDITOR reportes; auditoría según matriz. Dinero/cantidades se muestran desde strings y snapshots del backend. Arrays legacy, limit/offset y stock paged opcional diferenciados; flags apagados en demo                         |
| errores                | filtro backend statusCode/path/timestamp, validación 400, JWT 401, rol/origen 403, recurso 404, negocio/stock/version 409, 500 genérico. Mensajes específicos para versión, reconciliación y resultado incierto                               |
| SSE                    | GET operations/events solo cookie + JWT + flag; fetch con credentials y cabecera Last-Event-ID string; version string, related.restaurantTableId/saleTicketId/tableOrderId; eventos de ventas/comandas refrescan mesas, inventario y reportes |
| resync                 | señal real resync.required provoca invalidación/refetch activo de todos los dominios operativos. Conexión/reconexión y visibilidad también refrescan para cubrir huecos de replay                                                             |

La primera adaptación confiaba en la reconexión nativa de EventSource. Una prueba
offline no observó el cursor esperado y quedó fallida con traza. El transporte final
lee SSE por fetch, procesa frames fragmentados/CRLF/heartbeat y reconecta con cursor
explícito, sin convertir BigInt a Number. No usa query `lastEventId` ni inventa endpoints.

## Idempotencia y sesión

La intención se escribe en sessionStorage antes del envío, identificada por recurso,
operación y payload canónico. Solicitudes simultáneas iguales comparten una promesa.
Rerender/recarga y error de transporte/5xx conservan clave; payload diferente recibe
otra clave; éxito o rechazo definitivo terminan esa intención. Logout borra las claves
locales junto con sesión/cache. No se presume el éxito de una respuesta perdida:
se consulta el estado o se reenvían los mismos datos con la clave retenida.

La demo elige cookie/SSE. API y frontend corren en producción local; proxy `/backend`
conserva cookie y Origin. Backend requiere origen exacto en mutaciones con cookie;
se prueban rechazo de origen externo y ausente, HttpOnly, Secure, SameSite=Lax,
recarga, expiración, logout y revocación del JWT capturado. HTTPS es necesario fuera
de localhost. No se crea refresh, ownership ni cambio de permisos del backend.

El bearer permanece compatible; se prueba además por HTTP real en proceso separado
con AUTH_COOKIE=false/AUTH_TOKEN_RESPONSE=true. Logout de JWT legacy sin jti sigue
sin revocación individual: el check exige que el token aún funcione, documentando
esa limitación; no se la oculta limpiando localStorage.

## Recorrido y reproducción

```bash
npm ci
npm run verify
npm audit --json
npm audit --omit=dev --json
npx playwright install chromium
npm run test:fullstack
```

Docker requerido; puertos propios 55481 API, 55482 frontend, 55483 PostgreSQL.
Runner clona backend por separado y verifica SHA, instala con npm ci, genera Prisma,
compila ambos, comprueba presupuesto, crea PostgreSQL 17.9 nuevo por vuelta, aplica
16 migraciones desde cero y seed ficticio. Readiness usa probes con deadline (no
sleeps para carreras). Credenciales/JWT secret se generan por vuelta y no se reutilizan.
El mismo build de producción se prueba en ambas vueltas. API se reinicia entre
proyectos para aislar el limitador en memoria; la segunda vuelta empieza desde DB vacía.

Cada proyecto ejecuta un journey integrado con pasos separados, no 13 tests aislados:
login/navegación; mesa y orden vacía; agregar/editar/DELETE; dos sesiones y stale;
doble submit y transporte perdido después del commit real; SALE_OUT/stock/mesa/auditoría/
reportes; reconexión SSE; void/VOID_REVERSAL/stock; insuficiencia; replay-limit/resync;
CSRF/roles/expiración/login inválido; logout/revocación. Roles CASHIER y AUDITOR se
comprueban por HTTP real y pantalla denegada. ADMIN prueba cierre y anulación.

No hay mocks de APIs comerciales. La única ruta interceptada ejecuta `route.fetch`
contra la API y descarta su respuesta para provocar incertidumbre. El replay se
reenvía a esa misma API con la clave/payload guardados; PostgreSQL acredita un único
SALE_OUT y VOID_REVERSAL. La fixture de 1001 OperationEvent solo llena historia SSE;
no cambia ventas, inventario ni respuestas. Tests unitarios usan mocks identificados.

Chromium escritorio y Pixel 7 emulado, sin afirmar dispositivos físicos ni Firefox/
WebKit ni revisión humana. Hay capturas de salón/reportes, trazas de todos los
journeys, videos en fallo, JSON/HTML, OpenAPI y logs. `run-*` conserva cada intento;
no se pisa una traza fallida para publicar verde. Limpieza acotada a contenedores
propios y PIDs lanzados; conserva error original y registra cleanupExit.

Los intentos iniciales registran emails inválidos de fixture, readiness por ruta
incorrecta, locator de panel desktop, typecheck de un test nuevo, locator de void,
una carrera en el propio test de respuesta perdida y reconexión SSE sin cursor.
Se corrigieron; no se convirtieron en skips. El runner final usa retries 0.

La ejecución local final `run-1790783844733` terminó con exit 0:

| Vuelta | Inicio/fin UTC              | Escritorio         | Móvil emulado      | Bearer HTTP        | Limpieza |
| ------ | --------------------------- | ------------------ | ------------------ | ------------------ | -------- |
| 1      | 15:58:21.010 / 15:59:33.020 | 1 journey aprobado | 1 journey aprobado | 4 checks aprobados | exit 0   |
| 2      | 15:59:33.021 / 16:00:22.887 | 1 journey aprobado | 1 journey aprobado | 4 checks aprobados | exit 0   |

Total: 4 journeys reales, 8 checks bearer, 0 fallos, 0 skips, 0 flaky, 0 reintentos.
Cada vuelta aplicó las 16 migraciones y seed sobre una base nueva. Los cuatro
reportes JSON y HTML existen y fueron validados antes de declarar éxito. Al cierre,
`docker ps -a --filter label=restaurant.frontend-integration=true` no devuelve contenedores.
[Resumen local versionado](evidence/local-results.json) conserva metadata, conteos,
auditorías y hashes de reportes; los artefactos completos permanecen en
`output/playwright/run-1790783844733`, fuera de Git.

La verificación estática final, 15:56:19–15:57:03 UTC, aprobó `npm run verify`
completo después de `npm ci`: lint, formato sin escritura, TypeScript, 86 tests en
34 suites, build y bundle. Se añadieron 15 tests respecto de los 71 de la base.

Además de las iteraciones iniciales, se corrigió una carrera offline/online del
transporte SSE móvil y se hizo síncrona la lectura del header en el test. Un intento
posterior quedó invalidado: ejecutar npm ci mientras Playwright estaba activo
provocó EPERM y un reporte HTML incompleto aunque el CLI terminó con código 0.
Ese intento se conserva como fallido, no acredita las dos vueltas. El runner final
rechaza reportes ausentes y resultados incompletos; se repitieron instalación,
verificación y ambas vueltas sin modificar dependencias durante su ejecución.

## CI, presupuestos y límites

CI separa verify y fullstack (dos vueltas), contents:read, concurrency y timeouts
15/30 minutos; CodeQL 20 minutos con security-events:write solo en su job.
Artifacts 14 días incluso en fallo. Acciones oficiales fijadas a SHA, releases y
manifests node24 comprobados el 2026-09-30:
[checkout 7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1),
[setup-node 7.0.0](https://github.com/actions/setup-node/releases/tag/v7.0.0),
[upload-artifact 7.0.1](https://github.com/actions/upload-artifact/releases/tag/v7.0.1),
[CodeQL 4.38.2](https://github.com/github/codeql-action/releases/tag/v4.38.2).

Los límites originales 65 KiB dashboard / 170 KiB resto se conservan. Base gzip:
58.1/73.7/118.7/57.3/65.9/123.9/57.3 KiB (orden del runner). Las mediciones finales
son 50.1/66.5/111.4/49.6/58.6/116.4/49.6 KiB para el build cookie/SSE probado;
están en bundle-report.json y logs. Las siete rutas pasan sin cambiar los límites.

La primera CI, sobre `57b7a019278f732381643e124a84232bf8ae95bf`, aprobó verify
y CodeQL, pero falló fullstack móvil con HTTP 429. La traza registra 98 respuestas
200, 113 solicitudes abortadas y 8 respuestas 429 para el GET de una orden durante
el replay: cada evento disparaba invalidaciones redundantes. Se conserva el
[run fallido y sus artefactos](https://github.com/ferchox920/restaurant-admin/actions/runs/36739499276).
El frontend ahora agrupa las invalidaciones durante 50 ms, con una sola ejecución
por ráfaga que cubre todas las raíces operativas. Un test con 1001 eventos prueba
el límite de invalidaciones y la cancelación al desmontar. Se conserva el historial
SSE entre proyectos, el límite del backend de 100/minuto y todos los escenarios.

Evidencia remota posterior comprobada sobre código
`1168ecb7e3565af49be159dc15748b9bbed15570`:

- [CI verify y fullstack](https://github.com/ferchox920/restaurant-admin/actions/runs/36740710614):
  jobs `109974054757` y `109974055118` success. Artifact Vitest confirma 86 tests,
  34 suites, 0 fallos/pendientes; lint, formato, TypeScript, build y siete presupuestos
  pasan. Fullstack confirma dos bases nuevas, cuatro journeys sin skips/flaky/retries,
  ocho checks bearer y cleanupExit 0 en ambas vueltas.
- [CodeQL](https://github.com/ferchox920/restaurant-admin/actions/runs/36740710617):
  job `109974057314` success, log `Successfully uploaded results`, SARIF con 0 resultados.
- Artefactos descargados e inspeccionados, con SHA256 coincidente con el digest de GitHub:
  [verification](https://github.com/ferchox920/restaurant-admin/actions/runs/36740710614/artifacts/11110207386),
  [fullstack: HTML/JSON, trazas, capturas y logs](https://github.com/ferchox920/restaurant-admin/actions/runs/36740710614/artifacts/11110207625),
  [SARIF CodeQL](https://github.com/ferchox920/restaurant-admin/actions/runs/36740710617/artifacts/11109394247).
  Auditorías CI coinciden con local: 3 de desarrollo, 0 producción.

[Snapshot CI versionado](evidence/ci-results.json) registra head, jobs, metadata,
conteos, digests y hashes de logs. Este snapshot corresponde al código indicado;
los checks y enlaces del head final de documentación están en el
[PR frontend #1](https://github.com/ferchox920/restaurant-admin/pull/1).
La evidencia local anterior se distingue de esta ejecución en Linux. Los 0 resultados
de CodeQL no sustituyen la auditoría de dependencias ni una revisión humana.

Pendientes del backend conservados: 14 avisos npm (1 bajo, 2 moderados, 11 altos),
revocación legacy, retención indefinida y reconciliación manual de claves incompletas.
No produce table.changed/inventory.changed ni notifica específicamente replay >24h;
cliente refresca dominios relacionados al evento comercial y al conectar/visibilidad.
SSE no tiene filtro por rol/propietario en backend. Estas limitaciones no se declaran
resueltas por esta integración. Ninguna corrección requiere modificar el SHA fijado.

Ambos PR permanecen abiertos, sin merge/deploy/release. **Próxima acción única:**
revisar conjuntamente los PR backend y frontend y sus pendientes documentados.
