// Product reviews (Tier 3 C#2) — click-gated, self-reported, public immediately.

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const RATINGS = `${baseUrl}/startupark/api/ratings/products`;

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

export const fetchProductReviews = (productId) =>
  request(`${RATINGS}/${productId}`).then(r => r.data || []);

export const fetchReviewEligibility = (productId) =>
  request(`${RATINGS}/${productId}/eligibility`).then(r => r.data);

export const submitProductReview = (productId, payload) =>
  request(`${RATINGS}/${productId}`, { method: 'POST', body: JSON.stringify(payload) });

export const respondToReview = (ratingId, text) =>
  request(`${RATINGS}/${ratingId}/owner-response`, { method: 'POST', body: JSON.stringify({ text }) });
