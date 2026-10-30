import { BackendGateway } from './BackendGateway.js';
import { GatewayRequestHandler } from './GatewayRequestHandler.js';
import { findRouteByPath } from './GatewayRoutes.js';

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const rawBody = Buffer.concat(chunks).toString('utf8');
  if (rawBody.length === 0) {
    return undefined;
  }
  try {
    return JSON.parse(rawBody);
  } catch {
    return undefined;
  }
}

export function devGatewayPlugin(environment) {
  const requestHandler = new GatewayRequestHandler(
    new BackendGateway({ backendUrl: environment.BACKEND_URL, apiKey: environment.GATEWAY_API_KEY }),
  );

  return {
    name: 'dev-backend-gateway',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const route = findRouteByPath(new URL(request.url, 'http://localhost').pathname);
        if (!route) {
          next();
          return;
        }
        const result = await requestHandler.handle({
          route,
          method: request.method,
          cookieHeader: request.headers.cookie,
          body: await readJsonBody(request),
          secureCookies: false,
        });
        response.statusCode = result.status;
        for (const [name, value] of Object.entries(result.headers)) {
          response.setHeader(name, value);
        }
        response.end(result.body);
      });
    },
  };
}
