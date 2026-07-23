// Booking ratings, testimonials and meeting purposes (Tier 3 C#1).
// Single source of truth for the purpose enum so the booking form, the filter
// chips and the booking cards can never drift apart.

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const RATINGS = `${baseUrl}/startupark/api/ratings/bookings`;

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

// Order matters — this is the order shown in the select and the filter chips.
export const MEETING_PURPOSES = [
  { value: 'customer', label: 'Customer / Product interest', short: 'Customer' },
  { value: 'advice', label: 'Advice / Consulting', short: 'Advice' },
  { value: 'partnership', label: 'Partnership / Collaboration', short: 'Partnership' },
  { value: 'mentorship', label: 'Mentorship', short: 'Mentorship' },
  { value: 'investment', label: 'Investment discussion', short: 'Investment' },
  { value: 'media', label: 'Media / PR', short: 'Media' },
  { value: 'other', label: 'Other', short: 'Other' }
];

export const purposeLabel = (value) =>
  MEETING_PURPOSES.find(p => p.value === value)?.short || 'Other';

export const submitBookingRating = (bookingId, payload) =>
  request(`${RATINGS}/${bookingId}`, { method: 'POST', body: JSON.stringify(payload) });

export const approveElevation = (ratingId) =>
  request(`${RATINGS}/${ratingId}/approve-elevation`, { method: 'POST' });

export const declineElevation = (ratingId) =>
  request(`${RATINGS}/${ratingId}/decline-elevation`, { method: 'POST' });

export const fetchAwaitingMyRating = () =>
  request(`${RATINGS}/awaiting-my-rating`).then(r => r.data || []);

export const fetchPendingElevations = () =>
  request(`${RATINGS}/pending-elevation-approval`).then(r => r.data || []);

export const fetchTestimonials = (userId) =>
  request(`${RATINGS}/testimonials/${userId}`).then(r => r.data || []);

// Trust score lives on the existing ProjectArk route.
// compute=false: badge callers don't want a fabricated "newcomer" score for
// a profile with no activity yet — null means "nothing to show", not zero.
export const fetchTrustScore = (userId) =>
  request(`${baseUrl}/startupark/api/projectark/ratings/trust/${userId}?compute=false`).then(r => r.data);
