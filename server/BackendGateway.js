import { GatewayResponse } from './GatewayResponse.js';

const UPSTREAM_TIMEOUT_MS = 60_000;
const TRAILING_SLASHES = /\/+$/;

export class BackendGateway {
  #backendUrl;
  #apiKey;

  constructor({ backendUrl, apiKey }) {
    this.#backendUrl = backendUrl ? backendUrl.replace(TRAILING_SLASHES, '') : '';
    this.#apiKey = apiKey ?? '';
  }

  static fromEnvironment(environment = process.env) {
    return new BackendGateway({
      backendUrl: environment.BACKEND_URL,
      apiKey: environment.GATEWAY_API_KEY,
    });
  }

  isConfigured() {
    return this.#backendUrl.length > 0 && this.#apiKey.length > 0;
  }

  async forward(route, { userId, body }) {
    const upstreamResponse = await fetch(`${this.#backendUrl}${route.path}`, {
      method: route.method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Gateway-Key': this.#apiKey,
        'X-User-Id': userId,
      },
      body: route.method === 'GET' ? undefined : JSON.stringify(body ?? {}),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    return GatewayResponse.fromUpstream(upstreamResponse);
  }
}
