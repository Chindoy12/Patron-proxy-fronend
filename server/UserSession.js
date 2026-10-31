import { randomUUID } from 'node:crypto';

const COOKIE_NAME = 'quota_ai_uid';
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class UserSession {
  #userId;
  #isNew;

  constructor(userId, isNew) {
    this.#userId = userId;
    this.#isNew = isNew;
  }

  static fromCookieHeader(cookieHeader) {
    const existingUserId = UserSession.#readUserId(cookieHeader);
    return existingUserId
      ? new UserSession(existingUserId, false)
      : new UserSession(randomUUID(), true);
  }

  get userId() {
    return this.#userId;
  }

  get isNew() {
    return this.#isNew;
  }

  toSetCookieHeader(secure) {
    const attributes = [
      `${COOKIE_NAME}=${this.#userId}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      `Max-Age=${ONE_YEAR_IN_SECONDS}`,
    ];
    if (secure) {
      attributes.push('Secure');
    }
    return attributes.join('; ');
  }

  static #readUserId(cookieHeader) {
    if (!cookieHeader) {
      return null;
    }
    for (const cookie of cookieHeader.split(';')) {
      const [name, ...valueParts] = cookie.trim().split('=');
      if (name === COOKIE_NAME) {
        const value = valueParts.join('=');
        return UUID_PATTERN.test(value) ? value.toLowerCase() : null;
      }
    }
    return null;
  }
}
