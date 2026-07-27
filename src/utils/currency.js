import { detectCountry } from './locale';

// Common regions this app sees traffic from. Anything outside this map still
// works correctly — it just falls through to the INR default below, same as
// "no signal at all", per the India-first (not India-only) design.
const REGION_CURRENCY = {
  IN: { currency: 'INR', locale: 'en-IN' },
  US: { currency: 'USD', locale: 'en-US' },
  GB: { currency: 'GBP', locale: 'en-GB' },
  CA: { currency: 'CAD', locale: 'en-CA' },
  AU: { currency: 'AUD', locale: 'en-AU' },
  JP: { currency: 'JPY', locale: 'ja-JP' },
  DE: { currency: 'EUR', locale: 'de-DE' },
  FR: { currency: 'EUR', locale: 'fr-FR' },
  ES: { currency: 'EUR', locale: 'es-ES' },
  IT: { currency: 'EUR', locale: 'it-IT' },
  NL: { currency: 'EUR', locale: 'nl-NL' },
  IE: { currency: 'EUR', locale: 'en-IE' },
  SG: { currency: 'SGD', locale: 'en-SG' },
  AE: { currency: 'AED', locale: 'ar-AE' }
};

// Matches Razorpay, the only payment processor in this stack — the sensible
// last resort when no locale signal is available at all, not the default.
const DEFAULT_CONTEXT = { currency: 'INR', locale: 'en-IN' };

export function detectCurrencyContext() {
  const region = detectCountry();
  return REGION_CURRENCY[region] || DEFAULT_CONTEXT;
}

export function getCurrencySymbol(context) {
  const { currency, locale } = context || detectCurrencyContext();
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol'
    }).formatToParts(0);
    const symbolPart = parts.find((p) => p.type === 'currency');
    return symbolPart ? symbolPart.value : currency;
  } catch {
    return currency;
  }
}

/**
 * Display-only currency formatting — renders `amount` (already in the
 * relevant currency's major unit, e.g. rupees/dollars, not paise/cents) with
 * the viewer's auto-detected currency symbol. Never converts the number
 * itself; this is symbol/notation formatting, not currency conversion.
 */
export function formatCurrency(amount, { compact = false, context } = {}) {
  if (amount == null || Number.isNaN(Number(amount))) return '';
  const { currency, locale } = context || detectCurrencyContext();
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: compact ? 1 : 2
    }).format(Number(amount));
  } catch {
    return `₹${amount}`;
  }
}
