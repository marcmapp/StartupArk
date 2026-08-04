// Hub Billboard — cross-product events + updates feed shown on the Hub dashboard.
// Reads the generic contract shared by both item types:
//   { id, sourceProduct, type, title, description, image, author: { name, logoUrl },
//     meta, deepLinkPath }
// `meta` holds whatever is type-specific, so the frontend never branches on
// `type` except to pick which card component renders it:
//   event  meta: { eventDate, isLive, isFull, isRegistered }
//   update meta: { publishedAt, category, likeCount, liked, commentCount, postedBy }

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
