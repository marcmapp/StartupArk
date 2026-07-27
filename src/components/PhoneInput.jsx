import { useEffect, useMemo, useState } from 'react';
import { getDefaultCountry, isValidPhone, formatPhoneE164, listCountries } from '../utils/phone';

const COUNTRIES = listCountries();

/**
 * Drop-in replacement for a raw `<input type="tel">` — adds a country selector
 * (default auto-detected from the browser locale, falling back to India) and
 * client-side validation via libphonenumber-js. Fires the same
 * `onChange({ target: { name, value } })` shape as a native input's onChange,
 * so it slots into existing `handleChange(e)` form-state patterns unchanged.
 * The selected country is reported the same way under `countryName`
 * (defaults to `${name}Country`) so it can be sent to the backend, which
 * needs it to parse the number correctly.
 */
const PhoneInput = ({
  name = 'phone',
  countryName,
  value,
  countryValue,
  onChange,
  required = false,
  disabled = false,
  className = '',
  placeholder = 'Phone number'
}) => {
  const resolvedCountryName = countryName || `${name}Country`;
  const [country, setCountry] = useState(countryValue || getDefaultCountry());
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (countryValue) setCountry(countryValue);
  }, [countryValue]);

  // Push the auto-detected country up to the parent's form state on first
  // mount if it isn't tracking one yet, so it travels with the submit payload.
  useEffect(() => {
    if (!countryValue && onChange) {
      onChange({ target: { name: resolvedCountryName, value: country } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valid = useMemo(() => !value || isValidPhone(value, country), [value, country]);

  const handleCountrySelect = (e) => {
    const nextCountry = e.target.value;
    setCountry(nextCountry);
    onChange?.({ target: { name: resolvedCountryName, value: nextCountry } });
    if (value) onChange?.({ target: { name, value } });
  };

  const handleNumberChange = (e) => {
    onChange?.({ target: { name, value: e.target.value } });
  };

  const handleBlur = () => {
    setTouched(true);
    if (value) {
      const formatted = formatPhoneE164(value, country);
      if (formatted && formatted !== value) {
        onChange?.({ target: { name, value: formatted } });
      }
    }
  };

  const showError = touched && value && !valid;

  return (
    <div className={className}>
      <div className="flex gap-2">
        <select
          value={country}
          onChange={handleCountrySelect}
          disabled={disabled}
          aria-label="Country code"
          className="input-mono w-[6.75rem] shrink-0 px-2"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} +{c.callingCode}
            </option>
          ))}
        </select>
        <input
          type="tel"
          name={name}
          value={value || ''}
          onChange={handleNumberChange}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`input-mono flex-1 ${showError ? 'border-red-400 dark:border-red-500/60 focus:ring-red-400/40' : ''}`}
        />
      </div>
      {showError && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400">
          Please enter a valid phone number for the selected country.
        </p>
      )}
    </div>
  );
};

export default PhoneInput;
