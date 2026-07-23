// Event reviews (Tier 3 C#3) — attendance-gated, self-reported, public immediately.

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const RATINGS = `${baseUrl}/startupark/api/ratings/events`;

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

export const fetchEventReviews = (eventId) =>
  request(`${RATINGS}/${eventId}`).then(r => r.data || []);

export const fetchEventReviewEligibility = (eventId) =>
  request(`${RATINGS}/${eventId}/eligibility`).then(r => r.data);

export const submitEventReview = (eventId, payload) =>
  request(`${RATINGS}/${eventId}`, { method: 'POST', body: JSON.stringify(payload) });

export const respondToEventReview = (ratingId, text) =>
  request(`${RATINGS}/${ratingId}/owner-response`, { method: 'POST', body: JSON.stringify({ text }) });
