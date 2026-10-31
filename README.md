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
cp .env.example .env.local
npm install
npm run dev
```

## Despliegue en Vercel

1. En Vercel: **Add New → Project** e importa el mismo repositorio.
2. **Root Directory** = `./` (la raíz del repositorio). Framework preset: Vite (lo detecta `vercel.json`).
3. **Environment Variables** (Production):
   - `BACKEND_URL` = la URL de Railway del paso anterior, sin `/` final.
   - `GATEWAY_API_KEY` = el mismo secreto configurado en Railway.
4. **Deploy**.

