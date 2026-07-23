// Startup Updates / Newsletter module — discovery feed (category + following
// filters), draft/publish composer, and owner management (edit/delete).

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const UPDATES = `${baseUrl}/startupark/api/updates`;

export const UPDATE_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'product_launch', label: 'Product Launch' },
  { value: 'funding', label: 'Funding' },
  { value: 'hiring', label: 'Hiring' },
  { value: 'milestone', label: 'Milestone' },
];

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

// ── Discovery feed (public, published only) ──────────────────────────────
export const fetchUpdatesFeed = ({ type, followedOnly, page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (type) params.set('type', type);
  if (followedOnly) params.set('followedOnly', 'true');
  return request(`${UPDATES}?${params.toString()}`);
};

export const fetchUpdate = (id) =>
  request(`${UPDATES}/${id}`).then((r) => r.data);

// ── Owner management ──────────────────────────────────────────────────────
export const fetchMineUpdates = ({ status, page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set('status', status);
  return request(`${UPDATES}/mine?${params.toString()}`);
};

export const createUpdate = ({ title, body, updateType = 'general', imageUrl, status = 'published' }) =>
  request(UPDATES, { method: 'POST', body: JSON.stringify({ title, body, updateType, imageUrl, status }) });

export const publishUpdate = (id) =>
  request(`${UPDATES}/${id}/publish`, { method: 'POST' });

export const editUpdate = (id, { title, body, updateType, imageUrl }) =>
  request(`${UPDATES}/${id}`, { method: 'PUT', body: JSON.stringify({ title, body, updateType, imageUrl }) });

export const deleteUpdate = (id) =>
  request(`${UPDATES}/${id}`, { method: 'DELETE' });

export const toggleUpdateLike = (id) =>
  request(`${UPDATES}/${id}/like`, { method: 'PATCH' });

// Presigned-URL upload, mirroring the Products image flow: ask the backend for
// a PUT URL, upload the file directly to R2, then save the returned key as imageUrl.
export const uploadUpdateImage = async (id, file) => {
  const meta = await request(`${UPDATES}/${id}/upload`, {
    method: 'POST',
    body: JSON.stringify({ filename: file.name, contentType: file.type })
  });
  await fetch(meta.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
  return meta.key;
};
