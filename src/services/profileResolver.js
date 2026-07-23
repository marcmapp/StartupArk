// services/profileResolver.js
// Tier 3 C#9 — userId -> routable profile link. Thin client for
// GET /startupark/api/profile/resolve/:userId. Returns null (never throws)
// so callers can render a "profile unavailable" state instead of a dead link.

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function resolveProfileLink(userId) {
  if (!userId) return null;
  try {
    const res = await fetch(`${baseUrl}/startupark/api/profile/resolve/${userId}`);
    if (!res.ok) return null;
    const body = await res.json();
    return body.routePath || null;
  } catch {
    return null;
  }
}
