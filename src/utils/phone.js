import { parsePhoneNumberFromString, getCountries, getCountryCallingCode, isSupportedCountry } from 'libphonenumber-js';
import { detectCountry } from './locale';

export function getDefaultCountry() {
  const detected = detectCountry();
  return isSupportedCountry(detected) ? detected : 'IN';
}

export function isValidPhone(value, country) {
  if (!value) return false;
  try {
    const parsed = parsePhoneNumberFromString(String(value), country);
    return !!parsed && parsed.isValid();
  } catch {
    return false;
  }
}

export function formatPhoneE164(value, country) {
  try {
    const parsed = parsePhoneNumberFromString(String(value), country);
    return parsed && parsed.isValid() ? parsed.number : null;
  } catch {
    return null;
  }
}

const regionNames = typeof Intl !== 'undefined' && Intl.DisplayNames
  ? new Intl.DisplayNames(['en'], { type: 'region' })
  : null;

export function listCountries() {
  return getCountries()
    .map((code) => ({
      code,
      callingCode: getCountryCallingCode(code),
      name: regionNames ? (regionNames.of(code) || code) : code
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
