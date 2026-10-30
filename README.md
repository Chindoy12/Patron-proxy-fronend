# Quota AI — Plataforma de consumo de IA con Proxy de rate limiting y cuotas

Taller de Patrones de Software (Patrón Proxy).

```
Usuario ──► Frontend (Vercel) ──► Gateway /api/* (Vercel Functions) ──► Backend (Railway)
Usuario ◄── Frontend (Vercel) ◄── Gateway /api/* (Vercel Functions) ◄── Backend (Railway)
```

El navegador **nunca** se comunica con el backend. Solo conoce rutas relativas `/api/...` del mismo
dominio de Vercel. Las funciones serverless de Vercel agregan la llave secreta `X-Gateway-Key` y el
identificador del usuario (`X-User-Id`, tomado de una cookie `HttpOnly`) y reenvían la petición a Railway.
El backend rechaza con `401` cualquier llamada que no traiga la llave, y no habilita CORS, por lo que un
navegador tampoco podría llamarlo directamente.

## Estructura

```
backend/    Spring Boot 3.5 · Java 21
frontend/   React 19 + TypeScript + Vite · Gateway serverless para Vercel
```

## Backend

### Patrón Proxy

| Rol del patrón | Clase |
| --- | --- |
| Interfaz común (Subject) | `ai/AIGenerationService` → `generate(GenerationRequest): GenerationResponse` |
| Objeto real (RealSubject) | `ai/MockAIGenerationService` → `Thread.sleep(1200ms)` y texto aleatorio predefinido |
| Proxy 1 | `ai/proxy/RateLimitProxyService` → N requests/minuto según plan, si supera lanza `429` + `Retry-After` |
| Proxy 2 | `ai/proxy/QuotaProxyService` → verifica cuota mensual, descuenta tokens, si se agota lanza `402` |
| Composición de la cadena | `config/AiServiceConfiguration` → `RateLimit → Quota → Mock` |

### Planes (`account/Plan`)

| Plan | Requests/min | Tokens/mes |
| --- | --- | --- |
| FREE | 10 | 50.000 |
| PRO | 60 | 500.000 |
| ENTERPRISE | ilimitado | ilimitado |

### Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/ai/generate` | Pasa por el proxy chain completo. Body: `{ "prompt": "..." }` |
| GET | `/api/quota/status` | Tokens usados, tokens restantes, `resetDate`, plan actual (y estado del rate limit) |
| GET | `/api/quota/history` | Uso diario de los últimos 7 días |
| POST | `/api/quota/upgrade` | Upgrade de plan FREE → PRO (`409` si no aplica) |
| GET | `/actuator/health` | Health check para Railway (público) |

Todas las rutas `/api/*` exigen los encabezados `X-Gateway-Key` y `X-User-Id` (UUID).

### Tareas programadas (`scheduling/UsageResetScheduler`)

- Cada minuto (`0 * * * * *`): reinicia los contadores de rate limit.
- El primer día de cada mes a medianoche (`0 0 0 1 * *`): reinicia la cuota mensual de tokens.

### Ejecutar localmente

```bash
cd backend
GATEWAY_API_KEY=dev-key mvn spring-boot:run
mvn test
```

## Frontend

- Interfaz tipo chat para enviar prompts.
- Barra de progreso de tokens usados vs disponibles, actualizada después de cada request.
- Contador de requests por minuto con cuenta regresiva hasta el reset.
- Al alcanzar el rate limit se deshabilita el botón de envío y se muestra el countdown.
- Al agotar la cuota mensual se muestra el modal de upgrade con simulación de pago (tarjeta de prueba `4242 4242 4242 4242`; no se envían datos de tarjeta a ningún servidor).
- Gráfica de barras con el uso por día de los últimos 7 días.
- Badge del plan actual con colores diferenciados (FREE / PRO / ENTERPRISE).
- Estimador de tokens antes de enviar el prompt (misma regla que el backend: 1 token ≈ 4 caracteres, más ~70 tokens de respuesta promedio).

### Gateway (`frontend/server` y `frontend/api`)

- `api/ai/generate.js`, `api/quota/*.js`: funciones serverless de Vercel, una por endpoint.
- `server/BackendGateway.js`: reenvía la petición a Railway con la llave secreta.
- `server/UserSession.js`: crea/lee la cookie `HttpOnly` con el id anónimo del usuario.
- `server/devGatewayPlugin.js`: el mismo gateway montado en `npm run dev`, para trabajar en local.

Las variables `BACKEND_URL` y `GATEWAY_API_KEY` no llevan prefijo `VITE_`, así que nunca llegan al
bundle del navegador.

### Ejecutar localmente

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Despliegue en producción

### 1. Backend en Railway

1. Sube el repositorio a GitHub.
2. En Railway: **New Project → Deploy from GitHub repo**.
3. En el servicio: **Settings → Root Directory** = `backend`. Railway usa el `Dockerfile` y `railway.json`.
4. **Variables**:
   - `GATEWAY_API_KEY` = un secreto largo y aleatorio (por ejemplo `openssl rand -hex 32`).
   - `APP_TIME_ZONE` = `America/Bogota` (opcional).
5. **Settings → Networking → Generate Domain**. Copia la URL, por ejemplo `https://quota-ai-backend.up.railway.app`.
6. Verifica: `https://<tu-dominio>/actuator/health` responde `{"status":"UP"}` y `https://<tu-dominio>/api/quota/status` responde `401`.

### 2. Frontend en Vercel

1. En Vercel: **Add New → Project** e importa el mismo repositorio.
2. **Root Directory** = `frontend`. Framework preset: Vite (lo detecta `vercel.json`).
3. **Environment Variables** (Production):
   - `BACKEND_URL` = la URL de Railway del paso anterior, sin `/` final.
   - `GATEWAY_API_KEY` = el mismo secreto configurado en Railway.
4. **Deploy**.

### Consideraciones

- El almacenamiento es en memoria (`InMemoryUserAccountRepository`), detrás de la interfaz
  `UserAccountRepository`. Un reinicio del backend borra el consumo; para persistirlo basta con otra
  implementación del repositorio (por ejemplo con JPA y PostgreSQL de Railway).
- Mantén **una sola réplica** del backend en Railway (`numReplicas: 1`), porque los contadores viven en memoria.
- El plan ENTERPRISE existe en el dominio y en la interfaz, pero el único upgrade expuesto es FREE → PRO, como pide el enunciado.
