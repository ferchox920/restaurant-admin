# 09 - Front Sprint 4 Catalog

## Objetivo del Sprint 4

Sprint 4 implemento catalogo funcional desde UI sobre la API backend ya existente.
El frontend administrativo ahora permite gestionar categorias, canales de venta y
productos sin tocar backend ni agregar reglas de negocio fuera del contrato actual.

## Modulos implementados

- Categorias.
- Canales de venta.
- Productos.
- Detalle basico de producto.

## Endpoints consumidos

### Categories

- `GET /api/categories`
- `POST /api/categories`
- `GET /api/categories/:id`
- `PATCH /api/categories/:id`
- `PATCH /api/categories/:id/deactivate`
- `PATCH /api/categories/:id/reactivate`

### Sales Channels

- `GET /api/sales-channels`
- `POST /api/sales-channels`
- `GET /api/sales-channels/:id`
- `PATCH /api/sales-channels/:id`
- `PATCH /api/sales-channels/:id/deactivate`
- `PATCH /api/sales-channels/:id/reactivate`

### Products

- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`
- `PATCH /api/products/:id`
- `PATCH /api/products/:id/deactivate`
- `PATCH /api/products/:id/reactivate`

## Rutas implementadas

- `/categories`
- `/sales-channels`
- `/products`
- `/products/[id]`

## Roles y permisos

### ADMIN

- Ve categorias, canales y productos.
- Puede crear, editar, desactivar y reactivar.

### MANAGER

- Ve categorias, canales y productos.
- Puede crear, editar, desactivar y reactivar.

### AUDITOR

- Puede consultar categorias, canales y productos.
- Puede ver `/products/[id]`.
- No ve acciones de mutacion.

### CASHIER

- No accede a pantallas de catalogo en Sprint 4.
- Si intenta entrar manualmente, el frontend redirige a `/forbidden`.

## Reglas de negocio respetadas

- La API backend sigue siendo la fuente de verdad.
- La UI no elimina fisicamente entidades.
- Desactivar no elimina.
- Reactivar es una accion explicita.
- Crear producto no crea stock.
- Crear producto no crea costo.
- Crear producto no crea precio.
- `RECIPE_BASED` se muestra como reservado o no operativo.
- `NON_STOCKED` se muestra como no inventariable.
- `FINISHED_PRODUCT` se muestra como inventariable futuro.
- Costos historicos y precios por canal quedan para Front Sprint 5.
- Inventario queda para Front Sprint 6.

## Estados UI implementados

- loading inicial;
- error general de API o conexion;
- empty state;
- forbidden;
- not found en detalle de producto;
- conflict en formularios.

## Que no se implemento todavia

- costos historicos UI;
- precios por canal UI;
- inventario UI;
- ventas UI;
- reportes reales UI;
- auditoria UI;
- usuarios UI;
- `/settings`.
