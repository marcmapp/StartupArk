// Hub Billboard — cross-product events + updates feed shown on the Hub dashboard.
// Reads only the generic { id, sourceProduct, type, title, snippet, startupName,
// startupId, startupLogoUrl, eventDate, publishedAt, deepLinkPath, imageUrl,
// updateType } contract. imageUrl/updateType are update-only (null for events).

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const HUB = `${baseUrl}/api/hub`;

function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request(url, options = {}) {
  const res = await fetch(url, { headers: authHeaders(), ...options });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

export const fetchBillboard = ({ type = 'all', limit = 10 } = {}) =>
  request(`${HUB}/billboard?type=${encodeURIComponent(type)}&limit=${encodeURIComponent(limit)}`);
