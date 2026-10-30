export const GatewayRoutes = Object.freeze({
  GENERATE: Object.freeze({ path: '/api/ai/generate', method: 'POST' }),
  QUOTA_STATUS: Object.freeze({ path: '/api/quota/status', method: 'GET' }),
  QUOTA_HISTORY: Object.freeze({ path: '/api/quota/history', method: 'GET' }),
  QUOTA_UPGRADE: Object.freeze({ path: '/api/quota/upgrade', method: 'POST' }),
});

export function findRouteByPath(pathname) {
  return Object.values(GatewayRoutes).find((route) => route.path === pathname) ?? null;
}
