# Cierre técnico de la etapa final

Inicio frontend: `de1d955b155a42cb097f8f06652a9cd4ade1192e`. Backend fijado: `5562dec6cef7c00f76c31cc5bf663f5cf282ae14`, publicado primero y con [CI](https://github.com/ferchox920/restaurant-api/actions/runs/36761935610) y [CodeQL](https://github.com/ferchox920/restaurant-api/actions/runs/36761935471) inspeccionados. El SHA frontend final y sus workflows se registran en el PR actual al publicar; este documento describe la ejecución local previa, no presupone CI.

| Brecha                      | Corrección y prueba                                                                                                                                                          | Estado                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Dependencias                | Vitest 4.1.11 y actualizaciones compatibles; advisories y cadenas individuales; gate CI estricto para ambas consultas y sus errores                                          | 0 completo / 0 producción, sin excepciones |
| SSE inválido o restringido  | Backend valida cookie/JWT/sesión/usuario/rol y filtra tipos/campos; frontend termina ante 401/403/session.invalid y desactiva consultas cookie                               | Verificado en unitarias, PostgreSQL y UI   |
| Conflicto desde UI          | Dos contextos, SSE del contexto obsoleto controlado solo por transporte; PATCH 409 visible, refetch del consumo vigente, una sola mutación                                   | Verificado en 4 ejecuciones finales        |
| Respuesta comercial perdida | Commit real mediante route.fetch y pérdida solo de respuesta; incertidumbre visible, reload, recuperación manual con clave/payload originales; un ticket y un movimiento SQL | Verificado en 4 ejecuciones finales        |
| Logout y expiración         | Logout UI revoca cookie; SSE abierto se cierra; expiración vuelve al login exacto con formulario visible y sin tráfico posterior                                             | 4 ejecuciones finales por caso             |
| Históricos incompletos      | Conflicto explícito, identificación y reconciliación conservadora; jamás borrar clave para repetir operación incierta                                                        | Límite documentado                         |
| Presentación                | Demo única cookie, arquitectura, siete capturas ficticias inspeccionadas por agente, CV y cinco puntos de entrevista                                                         | Revisión humana pendiente                  |

## Resultados nuevos y antecedentes

Los 86 unitarios frontend y recorridos anteriores del SHA inicial son antecedentes. La ejecución final local contiene **95 escenarios unitarios**, **5 escenarios únicos de navegador** (4 independientes nuevos + recorrido comercial conservado), **20 ejecuciones de navegador** = 5 × 2 proyectos × 2 vueltas desde servicios limpios, **4 controles bearer únicos / 8 ejecuciones HTTP**. Cero omisiones, cero flaky y cero retries automáticos. Chromium móvil es emulación; no se declara dispositivo físico.

El registro de las nueve invocaciones locales del runner conserva tres fallos de preparación sin ejecutar navegador, dos reproducciones interrumpidas y una corrección de fixture antes de tres ejecuciones completas de dos vueltas. Total histórico local: **75 ejecuciones de navegador, 71 pasadas, 4 fallidas, 0 omitidas**. Estas repeticiones manuales de diagnóstico no son escenarios únicos ni retries automáticos; la selección final es solamente el run `1790795330040` sobre el backend final. Los jobs CI posteriores constituyen otra ejecución independiente.

[JSON de comandos, códigos, fallos y conteos](final-stage-evidence.json) · [backend final: jobs, logs, tiempos y SARIF](backend-final-ci.json) · [backend anterior de esta etapa, conservado como antecedente](backend-first-stage-ci.json) · [advisories](dependencies-final.md).

## Reproducciones y controles

- Tres pruebas cliente SSE fallaron con la lógica anterior de reconexión; pasan tras terminar ante 401/403 y session.invalid.
- Dos pruebas cookie con fixtures corregidos reprodujeron la reinstalación de sesión/consultas tras logout o expiración; pasan al desactivar y cancelar lecturas.
- La UI anterior confirmó realmente la operación en PostgreSQL y perdió la respuesta; faltaba el aviso de incertidumbre/recuperación tras recargar. Se conserva el fallo antes de añadir el aviso manual.
- Un test adicional falló al recargar mientras la respuesta todavía estaba pendiente: ahora se recupera la intención persistida antes del envío aunque aún no exista el marcador del catch. No se repite automáticamente la operación.
- Se conservaron errores de preparación (npm incorrecto y restauración temporal incompleta), fixture M04 inexistente, dos expectativas URL incorrectas y aislamiento incompleto del directorio de traces; no se borraron pruebas ni se relajaron gates para obtener verde.

Comandos reales: `npm ci`, `npm audit --json`, `npm audit --omit=dev --json`, `npm run audit:check`, `npm run verify`, `npm run test:fullstack`. Ambos audits iniciales distinguen findings de errores: completo exit 1 con 3 avisos de desarrollo, producción exit 0 sin avisos; después ambos exit 0, sin errores de consulta. Verify pasa lint, formato, tipos, 95 unitarias, build y presupuesto **original** de las siete rutas. El runner instala y construye el backend fijado, migra PostgreSQL vacío, ejecuta seed y valida contrato comercial en cada vuelta; el backend además ejecutó 324 unitarias, 39 aceptación/concurrencia y seed idempotente por separado.

Los reportes JSON, HTML y traces se separan por vuelta/proyecto. El saneamiento ocurre también al fallar, antes del upload CI; una prueba protege ZIP anidado, HTML embebido, storageState, cookies y conservación de bytes PNG. La lectura independiente de artifacts locales finales revisó 1959 entradas de texto / 40 archivos ZIP y no encontró patrones JWT, contraseñas generadas, credenciales DB o estados cookie retenidos. Es una comprobación acotada, no una afirmación de DLP exhaustivo. Los fixtures usan usuarios y secretos descartables. Los logs fallidos locales permanecen en output ignorado; su resumen sin secretos se conserva aquí y CI conserva sus propios reportes durante 14 días.

## Política y límites

ADMIN/MANAGER/CASHIER pueden abrir SSE operacional; AUDITOR usa REST autorizado. Solo eventos operacionales conocidos con identificadores/versiones string; inventario omitido para CASHIER y sin costos, actor, email ni campos arbitrarios. Sesión/usuario/rol se revisan cada 2000 ms con deadline de 1000 ms y timer de expiración: cierre máximo probado de 3000 ms. CI backend final midió revocación 1989 ms, desactivación 2001 ms, cambio de rol 1999 ms y expiración JWT 1828 ms. Replay fuera de retención o demasiado amplio emite resync explícito; el cliente invalida lecturas. Las consultas SQL ya enviadas pueden terminar después de desconectar, sin entrega de eventos; timers/listeners propios se liberan.

[Demo, guía visual, capturas y material laboral](../demo.md). Bearer legacy sin jti no se revoca por logout; limpiar navegador no revoca una copia externa. Históricos idempotentes incompletos mantienen conflicto; claves confirmadas se conservan indefinidamente. No se añadió ownership, multitenancy, infraestructura distribuida ni proveedor. Límites visuales existentes: UUID de actor, etiquetas fallback de auditoría y nombre de canal ausente en ciertos detalles; documentados con capturas reales.

Única próxima acción del autor: realizar y registrar el recorrido visual humano de la guía. Ambos PR deben seguir abiertos en draft; no se fusiona, despliega ni crea release en esta etapa.
