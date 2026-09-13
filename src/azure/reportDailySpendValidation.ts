import { REPORT_DAILY_SPEND_MAX_DAYS, type ReportDailySpend } from './reportDailySpend';
import { isCount, isFiniteNumber, isRecord } from './reportEvidenceValidationHelpers';

const DAY_MS = 86_400_000;

const isCalendarDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
};

const isUtcTimestamp = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
  isCalendarDate(value.slice(0, 10)) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString() === (value.length === 20 ? value.replace('Z', '.000Z') : value);

const isCoverage = (value: unknown, covered: number, expected: number): boolean => {
  const status = covered === expected ? 'complete' : covered === 0 ? 'unavailable' : 'partial';
  return isRecord(value) && isCount(value.coveredDayCount) && value.coveredDayCount === covered && value.status === status;
};

export const isReportDailySpend = (value: unknown): value is ReportDailySpend => {
  if (
    !isRecord(value) ||
    !isCalendarDate(value.startDate) ||
    !isCalendarDate(value.endDate) ||
    value.dateBasis !== 'billing-calendar' ||
    typeof value.currency !== 'string' ||
    !/^[A-Z]{3}$/.test(value.currency) ||
    !isUtcTimestamp(value.generatedAt) ||
    !['current', 'stale', 'unavailable'].includes(value.freshness as string) ||
    !isRecord(value.coverage) ||
    !Array.isArray(value.entries) ||
    value.entries.length > REPORT_DAILY_SPEND_MAX_DAYS
  )
    return false;

  const expected = (Date.parse(value.endDate) - Date.parse(value.startDate)) / DAY_MS + 1;
  if (expected < 1 || expected > REPORT_DAILY_SPEND_MAX_DAYS) return false;
  if (
    (value.sourceObservedAt !== undefined &&
      (!isUtcTimestamp(value.sourceObservedAt) || Date.parse(value.sourceObservedAt) > Date.parse(value.generatedAt))) ||
    (value.entries.length > 0 && (value.sourceObservedAt === undefined || value.freshness === 'unavailable'))
  )
    return false;

  let previousDate = '';
  let billedDays = 0;
  let amortizedDays = 0;
  for (const entry of value.entries) {
    if (
      !isRecord(entry) ||
      !isCalendarDate(entry.date) ||
      entry.date <= previousDate ||
      entry.date < value.startDate ||
      entry.date > value.endDate ||
      (entry.cost === undefined && entry.costAmortized === undefined) ||
      (entry.cost !== undefined && !isFiniteNumber(entry.cost)) ||
      (entry.costAmortized !== undefined && !isFiniteNumber(entry.costAmortized))
    )
      return false;
    previousDate = entry.date;
    if (entry.cost !== undefined) billedDays++;
    if (entry.costAmortized !== undefined) amortizedDays++;
  }
  return isCoverage(value.coverage.billed, billedDays, expected) && isCoverage(value.coverage.amortized, amortizedDays, expected);
};
