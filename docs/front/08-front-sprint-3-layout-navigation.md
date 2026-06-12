# 08 - Front Sprint 3 Layout Navigation

## Objetivo del Sprint 3

Sprint 3 implemento el layout administrativo autenticado del frontend,
navegacion visual por rol, placeholders privados de modulos y estados visuales
minimos reutilizables para loading, forbidden y modulos en construccion.

## Archivos principales

- `components/layout/app-shell.tsx`
- `components/layout/sidebar.tsx`
- `components/layout/topbar.tsx`
- `components/layout/user-menu.tsx`
- `components/layout/nav-item.tsx`
- `components/layout/app-logo.tsx`
- `lib/permissions/navigation.ts`
- `lib/permissions/can-access-route.ts`
- `types/navigation.ts`
- `components/common/module-placeholder.tsx`
- `components/feedback/loading-state.tsx`
- `components/feedback/empty-state.tsx`
- `components/feedback/error-message.tsx`
- `components/feedback/forbidden-state.tsx`
- `app/(private)/layout.tsx`

## Rutas privadas disponibles

- `/dashboard`
- `/categories`
- `/sales-channels`
- `/products`
- `/inventory`
- `/sales`
- `/reports`
- `/reports/stock`
- `/reports/sales-by-channel`
- `/reports/sales-by-product`
- `/reports/sales-by-user`
- `/reports/inventory-movements`
- `/audit-logs`
- `/users`

No existen todavia rutas dinamicas placeholder para productos, inventario,
ventas, auditoria o usuarios. `/settings` sigue siendo solo placeholder
documental y no existe como ruta funcional.

## Navegacion por rol

- `ADMIN`: dashboard, categorias, canales, productos, inventario, ventas, reportes, auditoria y usuarios.
- `MANAGER`: dashboard, categorias, canales, productos, inventario, ventas y reportes.
- `CASHIER`: dashboard, ventas e inventario.
- `AUDITOR`: dashboard, ventas, reportes y auditoria.

La navegacion visual no reemplaza la autorizacion real del backend. Si un
usuario autenticado entra manualmente a una ruta privada no permitida, el
frontend redirige a `/forbidden`.

## Politica de layout y estados visuales

- `PrivateRoute` protege sesion y muestra `LoadingState` mientras valida la sesion.
- `RoleGuard` usa `canAccessRoute` con `usePathname` y `user.role`.
- `AppShell` renderiza sidebar, topbar y contenido privado solo para rutas autenticadas permitidas.
- `/login` no renderiza AppShell.
- `/forbidden` queda fuera del grupo privado y renderiza `ForbiddenState`.
- `ModulePlaceholder` mantiene layout propio, pero usa el mismo lenguaje visual de cards, spacing y mensajes seguros.

## Que no se implemento todavia

- no hay CRUDs;
- no hay consumo de endpoints de negocio;
- no hay catalogo funcional;
- no hay inventario funcional;
- no hay ventas funcionales desde UI;
- no hay reportes reales;
- no hay auditoria funcional desde UI;
- no hay gestion de usuarios funcional;
- no hay `/settings` funcional;
- no hay rutas dinamicas placeholder;
- no hay middleware de auth basado en cookies;
- no hay refresh token;
- no hay cookies `httpOnly`.

## Criterios de cierre del Sprint 3

- layout privado funcional;
- sidebar visible en rutas privadas;
- topbar visible en rutas privadas;
- usuario y rol actual visibles;
- logout funcional desde el menu de usuario;
- navegacion filtrada por rol;
- guard visual por ruta privada;
- placeholders principales y subrutas de reportes disponibles;
- estados visuales globales normalizados;
- `/settings` no implementado;
- `npm run build` pasa;
- `npm run lint` pasa.
