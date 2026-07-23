// Follow graph (Tier 2) — public follow/block relationship layer, separate
// from Favorites (private bookmark, untouched by this module).

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const FOLLOW = `${baseUrl}/startupark/api/follow`;

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

export const followUser = (userId) =>
  request(`${FOLLOW}/${userId}`, { method: 'POST' }).then(r => r.data);

export const unfollowUser = (userId) =>
  request(`${FOLLOW}/${userId}`, { method: 'DELETE' }).then(r => r.data);

export const blockUser = (userId) =>
  request(`${FOLLOW}/${userId}/block`, { method: 'POST' }).then(r => r.data);

export const unblockUser = (userId) =>
  request(`${FOLLOW}/${userId}/block`, { method: 'DELETE' }).then(r => r.data);

export const fetchFollowStatus = (userId) =>
  request(`${FOLLOW}/${userId}/status`).then(r => r.data.status);

export const fetchFollowers = (userId, { page = 1, limit = 20 } = {}) =>
  request(`${FOLLOW}/${userId}/followers?page=${page}&limit=${limit}`);

export const fetchFollowing = (userId, { page = 1, limit = 20 } = {}) =>
  request(`${FOLLOW}/${userId}/following?page=${page}&limit=${limit}`);
