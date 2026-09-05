import { apiRequest } from './apiClient';

const visitorKey = 'noviq_visitor_id';
const sessionKey = 'noviq_analytics_session';
const sessionTimeout = 30 * 60 * 1000;

function randomId() {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getVisitorId() {
  const current = window.localStorage.getItem(visitorKey);
  if (current) return current;
  const next = randomId();
  window.localStorage.setItem(visitorKey, next);
  return next;
}

function getSessionId() {
  const raw = window.sessionStorage.getItem(sessionKey);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { id: string; lastActive: number };
      if (Date.now() - parsed.lastActive < sessionTimeout) {
        window.sessionStorage.setItem(sessionKey, JSON.stringify({ ...parsed, lastActive: Date.now() }));
        return parsed.id;
      }
    } catch { /* create a new session below */ }
  }
  const next = { id: randomId(), lastActive: Date.now() };
  window.sessionStorage.setItem(sessionKey, JSON.stringify(next));
  return next.id;
}

function getSource() {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source')?.trim().slice(0, 40).toLowerCase();
  if (source) return source === 'instagram' || source === 'facebook' || source === 'google' ? source : 'Other';
  const referrer = document.referrer.toLowerCase();
  if (!referrer) return 'Direct';
  if (referrer.includes('instagram')) return 'Instagram';
  if (referrer.includes('facebook')) return 'Facebook';
  if (referrer.includes('google')) return 'Google';
  return 'Other';
}

export function trackStorefrontRoute(path: string) {
  if (path.startsWith('/admin')) return;
  const visitorId = getVisitorId();
  const sessionId = getSessionId();
  const startedKey = `${sessionKey}:started`;
  if (!window.sessionStorage.getItem(startedKey)) {
    window.sessionStorage.setItem(startedKey, '1');
    void apiRequest('/analytics/track', {
      body: JSON.stringify({ anonymousVisitorId: visitorId, eventType: 'session_start', path, sessionId, source: getSource() }),
      method: 'POST',
    }).catch(() => undefined);
  }
  const productMatch = path.match(/^\/product\/([^/]+)/);
  const eventType = productMatch ? 'product_view' : 'page_view';
  void apiRequest('/analytics/track', {
    body: JSON.stringify({
      anonymousVisitorId: visitorId,
      eventType,
      path,
      ...(productMatch ? { productSlug: decodeURIComponent(productMatch[1]) } : {}),
      referrer: document.referrer.slice(0, 500) || undefined,
      sessionId,
      source: getSource(),
    }),
    method: 'POST',
  }).catch(() => undefined);
}

export function getAdminAnalytics() {
  return apiRequest('/admin/analytics');
}

export function getAdminDashboard() {
  return apiRequest('/admin/dashboard');
}

export function getAdminReports(range: string) {
  return apiRequest(`/admin/reports?range=${range}`);
}
