// Shared locale-detection helper used by the phone input and currency utilities.
//
// Timezone is checked first — it reflects where the device physically is,
// regardless of what display language the OS happens to be set to (very
// common for e.g. an India-based user running an "English (US)" system
// locale, who would otherwise get misdetected as US). Browser language is
// the fallback signal, and India is the last resort only when neither
// signal resolves to anything, never the assumed default.
const TIMEZONE_COUNTRY = {
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN', // legacy IANA alias, still returned by some environments
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'Europe/London': 'GB',
  'Europe/Berlin': 'DE',
  'Europe/Paris': 'FR',
  'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT',
  'Europe/Amsterdam': 'NL',
  'Europe/Dublin': 'IE',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Perth': 'AU',
  'Asia/Tokyo': 'JP',
  'Asia/Singapore': 'SG',
  'Asia/Dubai': 'AE'
};

function detectCountryFromTimeZone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_COUNTRY[tz] || null;
  } catch {
    return null;
  }
}

function detectCountryFromLanguage() {
  try {
    const langs = (typeof navigator !== 'undefined' && (navigator.languages || [navigator.language])) || [];
    for (const lang of langs) {
      const region = lang && lang.split('-')[1];
      if (region && /^[a-zA-Z]{2}$/.test(region)) return region.toUpperCase();
    }
  } catch {
    /* no-op — fall through */
  }
  return null;
}

export function detectCountry() {
  return detectCountryFromTimeZone() || detectCountryFromLanguage() || 'IN';
}
