# Front Sprint 10.11 - Frontend Deploy Readiness

## Estrategia inicial recomendada

La estrategia inicial recomendada para este frontend es `Vercel`.

Motivos:

- alineacion natural con `Next.js`;
- menor friccion para primer deploy del MVP;
- soporte directo para build y serving del App Router;
- configuracion simple de variables publicas.

No implica deploy automatico ni publicacion sin confirmacion explicita.

## Variables publicas permitidas

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_NAME`

Regla:

- no agregar secretos ni credenciales bajo `NEXT_PUBLIC_*`.

## Build y runtime

Comandos esperados:

```bash
npm ci
npm run build
npm run start
```

El proyecto debe seguir pasando:

```bash
npm run test
npm run lint
npm run build
```

## Requisitos del backend

El backend desplegado debe ofrecer:

- API publica alcanzable por HTTPS;
- CORS configurado para el origen del frontend;
- auth operativa;
- rutas `/api` disponibles;
- usuarios seed o demo fuera del repo.

## Checklist post-deploy

Validar manualmente:

- `/login`;
- login valido;
- `/dashboard`;
- una consulta de catalogo;
- inventario;
- ventas;
- reportes;
- auditoria;
- logout;
- limpieza de sesion en `401`;
- conservacion de sesion en `403`.

## Riesgos conocidos

- el token sigue en `localStorage` como riesgo aceptado del MVP;
- cualquier desalineacion de CORS/API bloquea login y queries;
- faltan pruebas E2E reales contra entorno deployado;
- credenciales demo deben circular fuera del repo;
- logs del navegador o backend no deben imprimir tokens;
- el caching del hosting no debe enmascarar cambios de auth o de API.

## Readiness operacional

El frontend queda razonablemente listo para primer deploy si:

- build, lint y tests pasan;
- la documentacion de demo y limitaciones esta actualizada;
- el backend de destino expone el contrato esperado;
- existe una pasada manual integrada previa a abrir el entorno a terceros.
