import { BackendGateway } from './BackendGateway.js';
import { GatewayRequestHandler } from './GatewayRequestHandler.js';

const requestHandler = new GatewayRequestHandler(BackendGateway.fromEnvironment());

function readParsedBody(request) {
  try {
    return request.body;
  } catch {
    return undefined;
  }
}

export function createVercelFunction(route) {
  return async function handler(request, response) {
    const result = await requestHandler.handle({
      route,
      method: request.method,
      cookieHeader: request.headers.cookie,
      body: readParsedBody(request),
      secureCookies: true,
    });
    for (const [name, value] of Object.entries(result.headers)) {
      response.setHeader(name, value);
    }
    response.status(result.status).send(result.body);
  };
}
