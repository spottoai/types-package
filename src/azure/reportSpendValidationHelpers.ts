import { REPORT_SPEND_LIMITS } from './reportSpend';

export const isReportCalendarDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
};

export const isReportUtcTimestamp = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
  isReportCalendarDate(value.slice(0, 10)) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString() === (value.length === 20 ? value.replace('Z', '.000Z') : value);

export const isReportCurrency = (value: unknown): value is string => typeof value === 'string' && /^[A-Z]{3}$/.test(value);
export const isReportText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= REPORT_SPEND_LIMITS.textLength;

/** Bounded exact arithmetic avoids binary floating point and pathological decimal-string input. */
export const reportMoneyUnits = (value: unknown): bigint | undefined => {
  if (typeof value !== 'string' || value.length > 25 || !/^-?(?:0|[1-9]\d{0,14})(?:\.\d{1,8})?$/.test(value)) return undefined;
  const [whole, fraction = ''] = value.replace(/^-/, '').split('.');
  const amount = BigInt(whole) * 100000000n + BigInt(fraction.padEnd(8, '0'));
  return value.startsWith('-') ? -amount : amount;
};
