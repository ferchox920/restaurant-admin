# 10 - Front Sprint 5 Costs and Prices

## Objetivo del Sprint 5

Sprint 5 implementa en el frontend administrativo la consulta y creacion de
versiones historicas de costos por producto y precios por producto/canal.

La UI consume la API real del backend para:

- consultar costo vigente;
- consultar historial de costos;
- crear nueva version de costo;
- consultar precio vigente por canal;
- consultar historial de precios;
- crear nueva version de precio por canal.

## Rutas implementadas

- `/products/[id]`
- `/products/[id]/costs`
- `/products/[id]/prices`

## Endpoints consumidos

### Costos

- `GET /api/products/:id/costs`
- `GET /api/products/:id/costs/current`
- `POST /api/products/:id/costs`

### Precios

- `GET /api/products/:id/prices`
- `GET /api/products/:id/prices/current?channelId=...`
- `POST /api/products/:id/prices`

## Politica historica

Las pantallas de Sprint 5 siguen estas reglas funcionales:

1. Un costo no se edita.
2. Un precio no se edita.
3. Crear un nuevo costo cierra la version vigente anterior.
4. Crear un nuevo precio cierra unicamente el precio vigente del mismo producto
   y canal.
5. El frontend no envia fechas de vigencia si el backend las controla.
6. Los registros historicos no se borran desde UI.
7. Los tickets historicos conservan sus snapshots.
8. Un producto puede existir sin costo vigente.
9. Un producto puede existir sin precio para determinados canales.
10. Los decimales se reciben y muestran sin convertirlos de manera que pierdan
    precision.
11. La API sigue siendo la fuente de verdad.

Detalles adicionales del contrato real:

- `GET /api/products/:id/costs/current` devuelve `404` si no existe costo
  vigente.
- `GET /api/products/:id/prices/current?channelId=<uuid>` devuelve `404` si no
  existe precio vigente para ese canal.
- `GET /api/products/:id/prices?channelId=<uuid>` filtra historial por canal.
- Los valores monetarios de respuesta llegan serializados como `string`.
- La respuesta expone `createdById`, no un objeto `createdBy`.
- La respuesta de precios expone `salesChannelName`, no un objeto
  `salesChannel`.

## Navegacion

### `/products/[id]`

- resumen del producto;
- costo vigente resumido;
- precios vigentes resumidos por canal activo;
- enlaces a historiales de costos y precios.

### `/products/[id]/costs`

- costo vigente;
- formulario de nueva version;
- historial de costos.

### `/products/[id]/prices`

- selector de canal;
- precio vigente;
- formulario de nueva version;
- historial de precios.

## Funcionalidades implementadas

- costo vigente;
- historial de costos;
- nueva version de costo;
- selector de canal;
- precio vigente por canal;
- historial de precios;
- nueva version de precio;
- resumen real en detalle de producto.

## Roles

### `ADMIN` y `MANAGER`

- consultan costos y precios;
- consultan historiales;
- crean nuevas versiones.

### `AUDITOR`

- consulta costo vigente, precios vigentes e historiales;
- no crea versiones.

### `CASHIER`

- no accede a costos;
- no accede a administracion de precios;
- si intenta entrar manualmente a `/products/[id]`, `/products/[id]/costs` o
  `/products/[id]/prices`, termina en `/forbidden`.

## Reglas respetadas

- no editar historia;
- no borrar versiones;
- no enviar fechas;
- decimales preservados en tipos y formularios;
- tickets historicos no se recalculan;
- producto puede no tener costo o precio vigente.

## No implementado todavia

- inventario UI;
- ventas UI;
- reportes reales;
- auditoria UI;
- usuarios UI;
- pagos;
- caja;
- `/settings`.

## Criterios de aceptacion

- costo vigente visible;
- historial de costos visible;
- nueva version de costo funcional;
- selector de canal visible;
- precio vigente por canal visible;
- historial de precios visible;
- nueva version de precio funcional;
- estados sin costo o precio vigentes;
- permisos visuales correctos;
- build y lint pasando.

## Validacion manual

Si hay backend y credenciales disponibles, validar:

1. Abrir producto sin costo vigente.
2. Crear costo.
3. Crear segundo costo y verificar cierre visual del anterior.
4. Seleccionar canal sin precio.
5. Crear precio.
6. Crear segundo precio para el mismo canal.
7. Verificar que otros canales no cambien.
8. Verificar lectura con `AUDITOR`.
9. Verificar `/forbidden` con `CASHIER`.

Si el backend o las credenciales no estan disponibles, esta validacion queda
pendiente y no bloquea el cierre tecnico del sprint.
