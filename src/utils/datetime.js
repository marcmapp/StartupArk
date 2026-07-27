// Shared UTC → viewer-local date/time display formatting for Bookings,
// Calendar, and Events. India is the sensible default given the primary
// audience, but a real per-browser timezone signal always wins when present.
const DEFAULT_TIMEZONE = 'Asia/Kolkata';

export function detectTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

function toDate(value) {
  return value instanceof Date ? value : new Date(value);
}

/** e.g. "Mon, Jan 5, 2026" in the viewer's local timezone. */
export function formatDate(value, options = {}) {
  if (!value) return '';
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return 'Invalid Date';
  const { timeZone = detectTimeZone(), ...rest } = options;
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    timeZone,
    ...rest
  }).format(date);
}

/** e.g. "2:30 PM" in the viewer's local timezone. */
export function formatTime(value, options = {}) {
  if (!value) return '';
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return 'Invalid Date';
  const { timeZone = detectTimeZone(), ...rest } = options;
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone,
    ...rest
  }).format(date);
}

/** e.g. "Mon, Jan 5, 2026, 2:30 PM" in the viewer's local timezone. */
export function formatDateTime(value, options = {}) {
  if (!value) return '';
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return 'Invalid Date';
  const { timeZone = detectTimeZone(), ...rest } = options;
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone,
    ...rest
  }).format(date);
}
