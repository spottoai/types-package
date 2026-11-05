/** Public display-conversion evidence; provider billing facts remain in their source currency. */
export const CURRENCY_CONVERSION_CONTRACT_VERSION = 1 as const;
export const CURRENCY_CONVERSION_HEADER = 'X-Spotto-Currency-Conversion';
export const CURRENCY_CONVERSION_RATE_SOURCE = 'European Central Bank euro foreign exchange reference rates' as const;

/** Common evidence on a converted batch envelope/header or individual document. */
export interface CurrencyConversionContextV1 {
  contractVersion: typeof CURRENCY_CONVERSION_CONTRACT_VERSION;
  targetCurrency: string;
  /** Real calendar date, YYYY-MM-DD. Freshness is checked by the API. */
  rateDate: string;
  /** Lowercase hexadecimal SHA-256 of the API's canonical reference date/rate table. */
  rateSnapshotId: string;
  rateSource: typeof CURRENCY_CONVERSION_RATE_SOURCE;
}

export interface CurrencyConversionRateV1 {
  sourceCurrency: string;
  /** Exact positive decimal quote against EUR; EUR itself is 1. */
  sourceRate: string;
  /** Exact positive decimal quote of the target currency against EUR. */
  targetRate: string;
  /** Disclosure only: at most 18 fractional digits, rounded half away from zero. Never use for arithmetic. */
  rate: string;
}

export interface CurrencyConversionV1 extends CurrencyConversionContextV1 {
  /** Converted when any declared source differs from target; empty money documents are unchanged. */
  status: 'converted' | 'unchanged';
  /** Unique source entries in ascending ISO-code order, all quoting the same target. */
  rates: CurrencyConversionRateV1[];
}

/** Representable discovery scales; the API/platform owns authoritative ISO code/scale membership. */
export type CurrencyConversionMinorUnitScaleV1 = 0 | 1 | 2 | 3 | 4;

export interface CurrencyConversionCurrencyV1 {
  code: string;
  minorUnitScale: CurrencyConversionMinorUnitScaleV1;
}

/** Company-authorized capability discovery; no chosen user currency or company settings. */
export interface CurrencyConversionDiscoveryV1 extends Omit<CurrencyConversionContextV1, 'targetCurrency'> {
  /** Unique supported codes in ascending order, always including EUR. */
  currencies: CurrencyConversionCurrencyV1[];
}

type WireRecord = Record<string, unknown>;

const CONTEXT_KEYS = ['contractVersion', 'targetCurrency', 'rateDate', 'rateSnapshotId', 'rateSource'] as const;
const DOCUMENT_KEYS = [...CONTEXT_KEYS, 'status', 'rates'];
const DISCOVERY_KEYS = ['contractVersion', 'rateDate', 'rateSnapshotId', 'rateSource', 'currencies'];
const RATE_KEYS = ['sourceCurrency', 'sourceRate', 'targetRate', 'rate'];

const hasExactKeys = (value: unknown, keys: readonly string[]): value is WireRecord =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.keys(value).length === keys.length &&
  keys.every(key => Object.prototype.hasOwnProperty.call(value, key));

const isCurrencyCode = (value: unknown): value is string => typeof value === 'string' && value.length === 3 && /^[A-Z]{3}$/u.test(value);

const isDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
};

/** Canonical ordinary decimal text: no exponent, sign, whitespace, leading zeros or trailing fractional zeros. */
const isDecimal = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() === value && /^(?:0|[1-9]\d*)(?:\.\d*[1-9])?$/u.test(value);

const hasSnapshotFields = (value: WireRecord): boolean =>
  value.contractVersion === CURRENCY_CONVERSION_CONTRACT_VERSION &&
  isDate(value.rateDate) &&
  typeof value.rateSnapshotId === 'string' &&
  value.rateSnapshotId.length === 64 &&
  /^[a-f0-9]{64}$/u.test(value.rateSnapshotId) &&
  value.rateSource === CURRENCY_CONVERSION_RATE_SOURCE;

/** Validates declared wire evidence, not freshness, hash authenticity, supported-code membership or FX arithmetic. */
export function isCurrencyConversionContextV1(value: unknown): value is CurrencyConversionContextV1 {
  return hasExactKeys(value, CONTEXT_KEYS) && hasSnapshotFields(value) && isCurrencyCode(value.targetCurrency);
}

export function isCurrencyConversionRateV1(value: unknown): value is CurrencyConversionRateV1 {
  if (
    !hasExactKeys(value, RATE_KEYS) ||
    !isCurrencyCode(value.sourceCurrency) ||
    !isDecimal(value.sourceRate) ||
    value.sourceRate === '0' ||
    !isDecimal(value.targetRate) ||
    value.targetRate === '0' ||
    !isDecimal(value.rate)
  )
    return false;
  const point = value.rate.indexOf('.');
  return (
    (point < 0 || value.rate.length - point - 1 <= 18) &&
    (value.sourceCurrency !== 'EUR' || value.sourceRate === '1') &&
    (value.sourceRate !== value.targetRate || value.rate === '1')
  );
}

/** Checks status and cross-entry consistency in addition to the context/rate wire contracts. */
export function isCurrencyConversionV1(value: unknown): value is CurrencyConversionV1 {
  if (
    !hasExactKeys(value, DOCUMENT_KEYS) ||
    !hasSnapshotFields(value) ||
    !isCurrencyCode(value.targetCurrency) ||
    (value.status !== 'converted' && value.status !== 'unchanged') ||
    !Array.isArray(value.rates)
  )
    return false;

  let previousSource = '';
  let targetRate: string | undefined;
  let converted = false;
  for (const entry of value.rates) {
    if (!isCurrencyConversionRateV1(entry) || entry.sourceCurrency <= previousSource) return false;
    if (targetRate !== undefined && entry.targetRate !== targetRate) return false;
    if (value.targetCurrency === 'EUR' && entry.targetRate !== '1') return false;
    if (entry.sourceCurrency === value.targetCurrency) {
      if (entry.sourceRate !== entry.targetRate || entry.rate !== '1') return false;
    } else converted = true;
    previousSource = entry.sourceCurrency;
    targetRate = entry.targetRate;
  }
  return value.status === (converted ? 'converted' : 'unchanged');
}

export function isCurrencyConversionDiscoveryV1(value: unknown): value is CurrencyConversionDiscoveryV1 {
  if (!hasExactKeys(value, DISCOVERY_KEYS) || !hasSnapshotFields(value) || !Array.isArray(value.currencies)) return false;
  let previousCode = '';
  let includesEuro = false;
  for (const currency of value.currencies) {
    if (
      !hasExactKeys(currency, ['code', 'minorUnitScale']) ||
      !isCurrencyCode(currency.code) ||
      currency.code <= previousCode ||
      typeof currency.minorUnitScale !== 'number' ||
      !Number.isInteger(currency.minorUnitScale) ||
      currency.minorUnitScale < 0 ||
      currency.minorUnitScale > 4
    )
      return false;
    previousCode = currency.code;
    includesEuro ||= currency.code === 'EUR';
  }
  return includesEuro;
}
