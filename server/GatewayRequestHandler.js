import { GatewayResponse } from './GatewayResponse.js';
import { UserSession } from './UserSession.js';

export class GatewayRequestHandler {
  #gateway;

  constructor(gateway) {
    this.#gateway = gateway;
  }

  async handle({ route, method, cookieHeader, body, secureCookies }) {
    if (method !== route.method) {
      return GatewayResponse.error(405, 'Method Not Allowed', `Use ${route.method} for this endpoint`)
        .withHeader('Allow', route.method);
    }
    if (!this.#gateway.isConfigured()) {
      return GatewayResponse.error(500, 'Internal Server Error', 'The gateway is not configured');
    }

    const session = UserSession.fromCookieHeader(cookieHeader);
    const response = await this.#forwardSafely(route, session, body);
    return session.isNew
      ? response.withHeader('Set-Cookie', session.toSetCookieHeader(secureCookies))
      : response;
  }

  async #forwardSafely(route, session, body) {
    try {
      return await this.#gateway.forward(route, { userId: session.userId, body });
    } catch {
      return GatewayResponse.error(502, 'Bad Gateway', 'The AI service is temporarily unavailable');
    }
  }
}
