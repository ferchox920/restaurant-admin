# Dependencias: registro individual de la etapa final

Auditorías iniciales sobre los SHA de referencia, no resultados CI anteriores. Los totales de npm cuentan paquetes afectados; varios paquetes heredan el mismo advisory. Las entradas siguientes separan advisories únicos por paquete. Producción significa incluido por `npm audit --omit=dev`, incluso Prisma incorporado por peer dependency.

## @vitest/mocker — moderate; solo desarrollo

Cadenas del lockfile inicial:

- root → vitest@3.2.7 → @vitest/mocker@3.2.7

### [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) — moderate

Vitest: Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock

Versiones oficiales: >= 2.1.0, < 4.1.11; corregida: 4.1.11 / >= 5.0.0-beta.1, < 5.0.0-rc.2; corregida: 5.0.0-rc.2.

Exposición en este proyecto (inspección del código y de la cadena): Rutas de redirección de mocks en el servidor de pruebas; solo desarrollo, corregido con Vitest 4.1.11.

## esbuild — low; solo desarrollo

Cadenas del lockfile inicial:

- root → vitest@3.2.7 → @vitest/mocker@3.2.7 → vite@7.3.5 → esbuild@0.27.7
- root → vitest@3.2.7 → vite-node@3.2.4 → vite@7.3.5 → esbuild@0.27.7
- root → vitest@3.2.7 → vite@7.3.5 → esbuild@0.27.7

### [GHSA-g7r4-m6w7-qqqr](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr) — low

esbuild allows arbitrary file read when running the development server on Windows

Versiones oficiales: >= 0.27.3, < 0.28.1; corregida: 0.28.1.

Exposición en este proyecto (inspección del código y de la cadena): Servidor de desarrollo en Windows; el bundler no se publica como servicio en la demo. Se aplica la versión corregida compatible.

## vitest — moderate; solo desarrollo

Cadenas del lockfile inicial:

- root → vitest@3.2.7

### [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) — moderate

Vitest: Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock

Versiones oficiales: >= 2.1.0, < 4.1.11; corregida: 4.1.11 / >= 5.0.0-beta.1, < 5.0.0-rc.2; corregida: 5.0.0-rc.2.

Exposición en este proyecto (inspección del código y de la cadena): Servidor de desarrollo de pruebas con rutas de mocks; no se incluye en el build de producción. Se migra a Vitest 4.1.11.

## Resolución y control

Se conservaron todas las herramientas y funciones. Se ejecutó `npm audit fix` sin `--force`. CI ejecuta `npm run audit:check`: conserva JSON y códigos de salida, rechaza todo aviso de cualquier severidad y diferencia errores de consulta. No hay excepciones globales ni advisories permitidos.

## Migración y resultado

Inicial: 3 paquetes afectados, todos de desarrollo (1 bajo, 2 moderados); producción 0. Códigos de salida iniciales: completo 1 por hallazgos, producción 0; sin error de consulta. Después de instalación limpia: 0/0, ambos códigos 0.

Vitest se migra de la serie 3 a 4.1.11, la menor versión mayor corregida para GHSA-82fw-gwwq-j7x9; no se utiliza audit fix --force ni se retiran mocks/herramientas. La [guía oficial de migración v4](https://v4.vitest.dev/guide/migration) exige Node 20+ y Vite 6+ y describe los cambios de mocks/constructores. Las 86 pruebas originales pasaron tras migrar, y la suite completa ampliada contiene 95 escenarios. Los ajustes de fixtures nuevos no eliminan pruebas existentes.

Se aplica npm audit fix compatible a la cadena de build, y fflate es solo herramienta de desarrollo para sanear artifacts ZIP/HTML; no se incorpora al producto ni añade proveedor.

Versiones instaladas después de corregir:

- vitest: 4.1.11 (node_modules/vitest)
- @vitest/mocker: 4.1.11 (node_modules/@vitest/mocker)
- vite: 8.3.1 (node_modules/vite)
- esbuild: ya no está instalado en la cadena resuelta de Vite; no se retiró ninguna herramienta del proyecto.
- fflate: 0.8.3 (node_modules/fflate)
