const FORWARDED_UPSTREAM_HEADERS = ['content-type', 'retry-after'];

export class GatewayResponse {
  #status;
  #headers;
  #body;

  constructor(status, headers, body) {
    this.#status = status;
    this.#headers = { 'Cache-Control': 'no-store', ...headers };
    this.#body = body;
  }

  static json(status, payload) {
    return new GatewayResponse(status, { 'Content-Type': 'application/json' }, JSON.stringify(payload));
  }

  static error(status, error, message) {
    return GatewayResponse.json(status, { status, error, message, timestamp: new Date().toISOString() });
  }

  static async fromUpstream(upstreamResponse) {
    const headers = {};
    for (const name of FORWARDED_UPSTREAM_HEADERS) {
      const value = upstreamResponse.headers.get(name);
      if (value !== null) {
        headers[name] = value;
      }
    }
    return new GatewayResponse(upstreamResponse.status, headers, await upstreamResponse.text());
  }

  withHeader(name, value) {
    return new GatewayResponse(this.#status, { ...this.#headers, [name]: value }, this.#body);
  }

  get status() {
    return this.#status;
  }

  get headers() {
    return { ...this.#headers };
  }

  get body() {
    return this.#body;
  }
}
