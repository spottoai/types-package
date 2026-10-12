/** Background Current State admission prerequisites. Interactive covers may omit prepared-by; background v1 requires it. */
export const CURRENT_STATE_REPORT_SUPPORTED_CURRENCIES = [
  'USD',
  'NZD',
  'AUD',
  'CAD',
  'EUR',
  'GBP',
  'JPY',
  'CNY',
  'KRW',
  'INR',
  'BRL',
  'SEK',
  'NOK',
  'DKK',
  'CHF',
  'SGD',
  'HKD',
] as const;
export const CURRENT_STATE_REPORT_MAX_HOURLY_RATE = 10_000;

export interface CurrentStateReportPrerequisitesV1 {
  hourlyRateAmount?: number;
  hourlyRateCurrency?: string;
  scopeCurrencyCode: string;
  preparedBy?: string;
  providerName?: string | null;
  parentCompanyName?: string | null;
}

export const validateCurrentStateReportPrerequisitesV1 = (
  input: CurrentStateReportPrerequisitesV1
): { ok: true } | { ok: false; failureCode: 'invalid-rate' | 'invalid-currency' | 'no-prepared-by' } => {
  if (
    typeof input.hourlyRateAmount !== 'number' ||
    !Number.isFinite(input.hourlyRateAmount) ||
    input.hourlyRateAmount <= 0 ||
    input.hourlyRateAmount > CURRENT_STATE_REPORT_MAX_HOURLY_RATE ||
    typeof input.hourlyRateCurrency !== 'string' ||
    !input.hourlyRateCurrency.trim()
  ) {
    return { ok: false, failureCode: 'invalid-rate' };
  }
  if (!(CURRENT_STATE_REPORT_SUPPORTED_CURRENCIES as readonly string[]).includes(input.scopeCurrencyCode))
    return { ok: false, failureCode: 'invalid-currency' };
  const usableProvider = (name?: string | null): string | undefined => {
    const normalized = name?.trim();
    return normalized && normalized.toLowerCase() !== 'service provider' ? normalized : undefined;
  };
  const defaultProvider = usableProvider(input.providerName) ?? usableProvider(input.parentCompanyName);
  const preparedBy = input.preparedBy === undefined ? (defaultProvider ? `${defaultProvider} pre-sales team` : '') : input.preparedBy.trim();
  if (
    !preparedBy ||
    preparedBy.length > 120 ||
    /[<>]/u.test(preparedBy) ||
    Array.from(preparedBy).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)
  )
    return { ok: false, failureCode: 'no-prepared-by' };
  // A different hourly-rate currency remains valid: reports expose an unconverted rate and never invent FX.
  return { ok: true };
};
