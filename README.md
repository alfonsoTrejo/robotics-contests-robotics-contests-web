# RCMS Frontend

Frontend del sistema de gestion de torneos de robotica universitarios.

Stack actual:
- Next.js 16 (App Router + middleware)
- TypeScript
- Tailwind CSS + shadcn/ui
- Integracion con API RCMS documentada en `docs/api.md`

## Setup local

1. Instala dependencias:

```bash
npm install
```

2. Crea archivo de entorno:

```bash
cp .env.example .env.local
```

3. Levanta el servidor:

```bash
npm run dev
```

4. Abre:

`http://localhost:3000`

## Variables de entorno

- `NEXT_PUBLIC_API_BASE_URL`: URL base del backend (default: `http://localhost:8080/api`)
- `NEXT_PUBLIC_AUTH_COOKIE_NAME`: cookie de sesion (default: `rcms_token`)

## Rutas implementadas (iteracion 1)

Publicas:
- `/`
- `/contests/[id]`
- `/auth/login`
- `/auth/student/callback`

Administrador:
- `/admin/dashboard`
- `/admin/contests`

Estudiante:
- `/student/dashboard`
- `/student/history`

Proxy auth en Next:
- `/api/auth/login`
- `/api/auth/google/exchange`
- `/api/auth/logout`

## Notas importantes

- El bootstrap del primer ADMIN es fuera del frontend (segun definicion de alcance).
- El callback de estudiante intercambia `id_token` por sesion RCMS usando el endpoint `/auth/google` del backend.
- El middleware usa cookie de sesion + cookie de rol para proteger rutas por perfil.

## Documentacion

- API principal: `docs/api.md`
- Especificacion funcional: PDF en `docs/`
