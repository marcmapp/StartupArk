// services/search.js — Tier 3 C#9 Global Search client.
const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function globalSearch(q, { signal } = {}) {
  const trimmed = (q || '').trim();
  if (!trimmed) return { startups: [], products: [], talent: [], events: [], newsletter: [] };
  const res = await fetch(`${baseUrl}/startupark/api/search?q=${encodeURIComponent(trimmed)}`, { signal });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const body = await res.json();
  return body.data;
}
