// Fire-and-forget client-side analytics signal capture. Never blocks the UI
// and never surfaces errors — a failed analytics call must not affect the
// user-facing action it's attached to.
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const ANALYTICS_URL = `${baseUrl}/api/analytics/event`;

export function track(eventType, entityType, entityId, metadata) {
  const token = localStorage.getItem('token');
  if (!token) return; // analytics events require an authenticated userId

  fetch(ANALYTICS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ eventType, entityType, entityId, metadata }),
    keepalive: true
  }).catch(() => {});
}
