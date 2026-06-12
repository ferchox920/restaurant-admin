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
- Los valores monetarios de respuesta llegan serializados como `string`.
- La respuesta expone `createdById`, no un objeto `createdBy`.
- La respuesta de precios expone `salesChannelName`, no un objeto
  `salesChannel`.

## Navegacion

### `/products/[id]`

- resumen del producto;
- costo vigente resumido;
- precios vigentes resumidos para navegacion administrativa;
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
- los precios operativos futuros se consumiran desde flujo de venta y no desde
  estas pantallas administrativas.

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
